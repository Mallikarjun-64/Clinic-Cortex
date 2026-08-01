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
    // Doctor token failed, try patient
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

// @route   GET /api/messages/threads
// @desc    List message threads for the logged-in doctor or patient
router.get('/threads', authenticateEitherUser, async (req, res) => {
  try {
    let sql = '';
    let params = [];

    if (req.isDoctor) {
      sql = `SELECT * FROM message_threads WHERE doctor_id = $1 ORDER BY last_message_at DESC`;
      params = [req.user.id];
    } else {
      sql = `SELECT * FROM message_threads WHERE patient_id = $1 ORDER BY last_message_at DESC`;
      params = [req.patient.id];
    }

    const result = await query(sql, params);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      threads: result.rows
    });
  } catch (err) {
    console.error('Fetch Threads Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving messaging threads' });
  }
});

// @route   POST /api/messages/threads
// @desc    Find or create a message thread between a patient and a doctor
router.post('/threads', authenticateEitherUser, async (req, res) => {
  const doctorId = req.body.doctorId;
  const patientId = req.patient ? req.patient.id : req.body.patientId;

  if (!doctorId || !patientId) {
    return res.status(400).json({ success: false, message: 'Both doctorId and patientId are required' });
  }

  try {
    // 1. Check existing thread
    const existing = await query(
      `SELECT * FROM message_threads WHERE doctor_id = $1 AND patient_id = $2`,
      [doctorId, patientId]
    );

    if (existing.rows.length > 0) {
      return res.status(200).json({
        success: true,
        thread: existing.rows[0]
      });
    }

    // 2. Fetch patient info for thread metadata
    const patientRes = await query(`SELECT name FROM patients WHERE id = $1`, [patientId]);
    const patientName = patientRes.rows[0]?.name || 'Patient';

    // 3. Create new thread
    const newThread = await query(
      `INSERT INTO message_threads (doctor_id, patient_id, patient_name, last_message, last_message_at)
       VALUES ($1, $2, $3, 'Thread started', NOW())
       RETURNING *`,
      [doctorId, patientId, patientName]
    );

    res.status(201).json({
      success: true,
      thread: newThread.rows[0]
    });
  } catch (err) {
    console.error('Find/Create Thread Error:', err);
    res.status(500).json({ success: false, message: 'Server error initiating thread' });
  }
});

// @route   GET /api/messages/threads/:id
// @desc    Get all messages inside a specific thread
router.get('/threads/:id', authenticateEitherUser, async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Verify ownership based on caller type
    let threadCheckSql = 'SELECT id FROM message_threads WHERE id = $1 AND doctor_id = $2';
    let userId = req.user.id;

    if (req.isPatient) {
      threadCheckSql = 'SELECT id FROM message_threads WHERE id = $1 AND patient_id = $2';
      userId = req.patient.id;
    }

    const threadCheck = await query(threadCheckSql, [id, userId]);

    if (threadCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Message thread not found.' });
    }

    // 2. Fetch messages
    const messages = await query(
      `SELECT * FROM messages
       WHERE thread_id = $1
       ORDER BY sent_at ASC`,
      [id]
    );

    res.status(200).json({
      success: true,
      count: messages.rows.length,
      messages: messages.rows
    });
  } catch (err) {
    console.error('Fetch Thread Messages Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving messages' });
  }
});

// @route   POST /api/messages/threads/:id
// @desc    Send a message in a specific thread
router.post('/threads/:id', authenticateEitherUser, async (req, res) => {
  const { id } = req.params;
  const { content, senderType } = req.body;

  if (!content) {
    return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
  }

  try {
    // 1. Verify thread ownership
    let threadCheckSql = 'SELECT id FROM message_threads WHERE id = $1 AND doctor_id = $2';
    let userId = req.user.id;

    if (req.isPatient) {
      threadCheckSql = 'SELECT id FROM message_threads WHERE id = $1 AND patient_id = $2';
      userId = req.patient.id;
    }

    const threadCheck = await query(threadCheckSql, [id, userId]);

    if (threadCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Message thread not found.' });
    }

    const effectiveSenderType = senderType || (req.isPatient ? 'patient' : 'doctor');

    // 2. Insert new message
    const messageResult = await query(
      `INSERT INTO messages (thread_id, sender_type, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, effectiveSenderType, content]
    );

    // 3. Update thread preview metadata
    await query(
      `UPDATE message_threads
       SET last_message = $1, last_message_at = NOW()
       WHERE id = $2`,
      [content, id]
    );

    res.status(201).json({
      success: true,
      message: messageResult.rows[0]
    });
  } catch (err) {
    console.error('Send Message Error:', err);
    res.status(500).json({ success: false, message: 'Server error sending message' });
  }
});

export default router;

