import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get all notifications for the logged-in doctor
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM notifications
       WHERE doctor_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

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

// @route   PATCH /api/notifications/:id/read
// @desc    Mark a notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `UPDATE notifications
       SET is_read = true
       WHERE id = $1 AND doctor_id = $2
       RETURNING *`,
      [id, req.user.id]
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
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      'DELETE FROM notifications WHERE id = $1 AND doctor_id = $2 RETURNING id',
      [id, req.user.id]
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
