import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/schedule/slots
// @desc    Get all schedule slots for a doctor on a specific day of the week
router.get('/slots', authenticateToken, async (req, res) => {
  const { day } = req.query;

  if (!day) {
    return res.status(400).json({ success: false, message: 'Day of week is required' });
  }

  try {
    const result = await query(
      `SELECT * FROM schedule_slots
       WHERE doctor_id = $1 AND LOWER(day_of_week) = LOWER($2)
       ORDER BY start_time ASC`,
      [req.user.id, day]
    );

    res.status(200).json({
      success: true,
      day,
      count: result.rows.length,
      slots: result.rows
    });
  } catch (err) {
    console.error('Fetch Slots Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving schedule slots' });
  }
});

// @route   POST /api/schedule/slots
// @desc    Add a new schedule slot for a doctor
router.post('/slots', authenticateToken, async (req, res) => {
  const { dayOfWeek, startTime, endTime, slotType, isAvailable } = req.body;

  if (!dayOfWeek || !startTime || !endTime) {
    return res.status(400).json({ success: false, message: 'Day of week, start time, and end time are required' });
  }

  try {
    const result = await query(
      `INSERT INTO schedule_slots (doctor_id, day_of_week, start_time, end_time, slot_type, is_available)
       VALUES ($1, LOWER($2), $3, $4, COALESCE($5, 'Clinic'), COALESCE($6, true))
       RETURNING *`,
      [req.user.id, dayOfWeek, startTime, endTime, slotType, isAvailable]
    );

    res.status(201).json({
      success: true,
      message: 'Schedule slot added successfully',
      slot: result.rows[0]
    });
  } catch (err) {
    console.error('Create Slot Error:', err);
    res.status(500).json({ success: false, message: 'Server error adding schedule slot' });
  }
});

// @route   DELETE /api/schedule/slots/:id
// @desc    Delete a specific schedule slot
router.delete('/slots/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      'DELETE FROM schedule_slots WHERE id = $1 AND doctor_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Schedule slot not found' });
    }

    res.status(200).json({ success: true, message: 'Schedule slot deleted successfully' });
  } catch (err) {
    console.error('Delete Slot Error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting schedule slot' });
  }
});

// @route   GET /api/schedule/availability
// @desc    Get weekly availability summary configurations
router.get('/availability', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM availability
       WHERE doctor_id = $1
       ORDER BY 
         CASE LOWER(day_name)
           WHEN 'monday' THEN 1
           WHEN 'tuesday' THEN 2
           WHEN 'wednesday' THEN 3
           WHEN 'thursday' THEN 4
           WHEN 'friday' THEN 5
           WHEN 'saturday' THEN 6
           WHEN 'sunday' THEN 7
         END ASC`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      availability: result.rows
    });
  } catch (err) {
    console.error('Fetch Availability Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving availability settings' });
  }
});

// @route   PUT /api/schedule/availability/:day
// @desc    Toggle day active status or edit timing configurations
router.put('/availability/:day', authenticateToken, async (req, res) => {
  const { day } = req.params;
  const { status, totalSlots, workingHours } = req.body;

  try {
    const result = await query(
      `UPDATE availability
       SET status = COALESCE($1, status),
           total_slots = COALESCE($2, total_slots),
           working_hours = COALESCE($3, working_hours)
       WHERE doctor_id = $4 AND LOWER(day_name) = LOWER($5)
       RETURNING *`,
      [status, totalSlots, workingHours, req.user.id, day]
    );

    if (result.rows.length === 0) {
      // If record not found, create a new config row
      const newAvail = await query(
        `INSERT INTO availability (doctor_id, day_name, status, total_slots, working_hours)
         VALUES ($1, INITCAP($2), COALESCE($3, 'Active'), COALESCE($4, 0), COALESCE($5, '09:00 AM - 05:00 PM'))
         RETURNING *`,
        [req.user.id, day, status, totalSlots, workingHours]
      );
      return res.status(201).json({ success: true, availability: newAvail.rows[0] });
    }

    res.status(200).json({
      success: true,
      message: `${day} availability configured successfully`,
      availability: result.rows[0]
    });
  } catch (err) {
    console.error('Update Availability Error:', err);
    res.status(500).json({ success: false, message: 'Server error updating availability config' });
  }
});

export default router;
