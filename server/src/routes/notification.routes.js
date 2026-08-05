import express from 'express';
import { query } from '../config/db.js';
import { verifyToken, verifyPatientToken } from '../utils/jwt.js';

const router = express.Router();

// Middleware to authenticate either Doctor or Patient token
const authenticateEitherUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Missing authentication token'
    });
  }

  // 1. Try Doctor token
  try {
    const decodedDoctor = verifyToken(token);
    req.user = decodedDoctor;
    req.isDoctor = true;
    return next();
  } catch (err) {
    // Doctor token failed
  }

  // 2. Try Patient token
  try {
    const decodedPatient = verifyPatientToken(token);
    req.patient = decodedPatient;
    req.user = decodedPatient;
    req.isPatient = true;
    return next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Invalid authentication token'
    });
  }
};

// @route   GET /api/notifications
// @desc    Get all notifications for logged-in doctor or patient
router.get('/', authenticateEitherUser, async (req, res) => {
  try {
    let sql = '';
    let params = [];

    if (req.isDoctor) {
      sql = `SELECT * FROM notifications WHERE doctor_id = $1 ORDER BY created_at DESC`;
      params = [req.user.id];
    } else {
      sql = `SELECT * FROM notifications WHERE patient_id = $1 OR patient_name ILIKE $2 ORDER BY created_at DESC`;
      params = [req.patient.id, `%${req.patient.name || ''}%`];
    }

    const result = await query(sql, params);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      notifications: result.rows
    });
  } catch (err) {
    console.error('Fetch Notifications Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving notifications' });
  }
});

// @route   POST /api/notifications
// @desc    Create a new notification (e.g. video call start notification)
router.post('/', authenticateEitherUser, async (req, res) => {
  const { patientId, doctorId, appointmentId, title, body, category, notificationType, patientName } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }

  try {
    const docId = doctorId || (req.isDoctor ? req.user.id : null);
    const patId = patientId || (req.isPatient ? req.patient.id : null);

    const result = await query(
      `INSERT INTO notifications (doctor_id, patient_id, appointment_id, title, body, category, notification_type, patient_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        docId,
        patId,
        appointmentId || null,
        title,
        body || null,
        category || 'Urgent',
        notificationType || 'info',
        patientName || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification: result.rows[0]
    });
  } catch (err) {
    console.error('Create Notification Error:', err);
    res.status(500).json({ success: false, message: 'Server error creating notification' });
  }
});

// @route   PATCH /api/notifications/:id/read
// @desc    Mark a notification as read
router.patch('/:id/read', authenticateEitherUser, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `UPDATE notifications
       SET is_read = true
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification: result.rows[0]
    });
  } catch (err) {
    console.error('Read Notification Error:', err);
    res.status(500).json({ success: false, message: 'Server error updating notification' });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
router.delete('/:id', authenticateEitherUser, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      'DELETE FROM notifications WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Delete Notification Error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting notification' });
  }
});

export default router;
