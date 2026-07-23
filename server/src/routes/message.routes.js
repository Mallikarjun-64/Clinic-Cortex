import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/messages/threads
// @desc    List all message threads for the logged-in doctor
router.get('/threads', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM message_threads
       WHERE doctor_id = $1
       ORDER BY last_message_at DESC`,
      [req.user.id]
    );

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

// @route   GET /api/messages/threads/:id
// @desc    Get all messages inside a specific thread
router.get('/threads/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Verify thread belongs to the doctor
    const threadCheck = await query(
      'SELECT id FROM message_threads WHERE id = $1 AND doctor_id = $2',
      [id, req.user.id]
    );

    if (threadCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Message thread not found.' });
    }

    // 2. Fetch messages ordered chronologically
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
router.post('/threads/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { content, senderType } = req.body;

  if (!content) {
    return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
  }

  try {
    // 1. Verify thread ownership
    const threadCheck = await query(
      'SELECT id FROM message_threads WHERE id = $1 AND doctor_id = $2',
      [id, req.user.id]
    );

    if (threadCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Message thread not found.' });
    }

    // 2. Insert new message
    const messageResult = await query(
      `INSERT INTO messages (thread_id, sender_type, content)
       VALUES ($1, COALESCE($2, 'doctor'), $3)
       RETURNING *`,
      [id, senderType, content]
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
