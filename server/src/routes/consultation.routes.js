import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateUuidParam } from '../middleware/validate.js';

const router = express.Router();

// @route   GET /api/consultations
// @desc    List pending consultation requests for a doctor
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM consultation_requests
       WHERE doctor_id = $1 AND status = 'Pending'
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      requests: result.rows
    });
  } catch (err) {
    console.error('Fetch Consultations Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving consultation requests' });
  }
});

// @route   PATCH /api/consultations/:id/accept
// @desc    Accept a consultation request
router.patch('/:id/accept', authenticateToken, validateUuidParam, async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Update request status to 'Accepted'
    const result = await query(
      `UPDATE consultation_requests
       SET status = 'Accepted'
       WHERE id = $1 AND doctor_id = $2
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Consultation request not found.' });
    }

    const request = result.rows[0];

    // 2. Automatically spawn an appointment from the accepted request
    const appointmentDate = new Date().toISOString().split('T')[0]; // Schedule for today
    const appointmentTime = '12:00:00'; // Default slots allocation

    const appointment = await query(
      `INSERT INTO appointments (doctor_id, patient_name, visit_type, appointment_date, appointment_time, status, condition, notes)
       VALUES ($1, $2, $3, $4, $5, 'Scheduled', $6, $7)
       RETURNING *`,
      [req.user.id, request.patient_name, request.request_type, appointmentDate, appointmentTime, 'Urgent Review Request', request.notes]
    );

    res.status(200).json({
      success: true,
      message: 'Consultation request accepted and scheduled',
      request,
      appointment: appointment.rows[0]
    });

  } catch (err) {
    console.error('Accept Consultation Error:', err);
    res.status(500).json({ success: false, message: 'Server error accepting request' });
  }
});

// @route   PATCH /api/consultations/:id/reject
// @desc    Reject a consultation request
router.patch('/:id/reject', authenticateToken, validateUuidParam, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `UPDATE consultation_requests
       SET status = 'Rejected'
       WHERE id = $1 AND doctor_id = $2
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Consultation request not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Consultation request rejected successfully',
      request: result.rows[0]
    });

  } catch (err) {
    console.error('Reject Consultation Error:', err);
    res.status(500).json({ success: false, message: 'Server error rejecting request' });
  }
});

export default router;
