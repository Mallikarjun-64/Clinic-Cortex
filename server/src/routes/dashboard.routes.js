import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get aggregated overview statistics for the doctor's home dashboard
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Total unique patients assigned/treated
    const totalPatientsRes = await query(
      'SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE doctor_id = $1',
      [req.user.id]
    );

    // 2. Count of appointments scheduled for today
    const todayAppointmentsRes = await query(
      `SELECT COUNT(*) FROM appointments 
       WHERE doctor_id = $1 AND appointment_date = $2 AND status IN ('Scheduled', 'Confirmed', 'Waiting')`,
      [req.user.id, today]
    );

    // 3. Count of pending consultation requests
    const pendingRequestsRes = await query(
      `SELECT COUNT(*) FROM consultation_requests 
       WHERE doctor_id = $1 AND status = 'Pending'`,
      [req.user.id]
    );

    // 4. Completed visits count
    const completedVisitsRes = await query(
      `SELECT COUNT(*) FROM appointments 
       WHERE doctor_id = $1 AND status = 'Completed'`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      stats: {
        totalPatients: parseInt(totalPatientsRes.rows[0].count || '0'),
        todayAppointments: parseInt(todayAppointmentsRes.rows[0].count || '0'),
        pendingRequests: parseInt(pendingRequestsRes.rows[0].count || '0'),
        completedVisits: parseInt(completedVisitsRes.rows[0].count || '0')
      }
    });
  } catch (err) {
    console.error('Fetch Dashboard Stats Error:', err);
    res.status(500).json({ success: false, message: 'Server error compiling dashboard statistics' });
  }
});

// @route   GET /api/dashboard/revenue
// @desc    Get monthly revenue calculations
router.get('/revenue', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT COALESCE(SUM(d.clinic_fee), 0) as total_clinic_revenue, 
              COALESCE(SUM(d.online_fee), 0) as total_online_revenue
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.doctor_id = $1 AND a.status = 'Completed'`,
      [req.user.id]
    );

    const stats = result.rows[0];

    res.status(200).json({
      success: true,
      revenue: {
        clinic: parseFloat(stats.total_clinic_revenue),
        online: parseFloat(stats.total_online_revenue),
        total: parseFloat(stats.total_clinic_revenue) + parseFloat(stats.total_online_revenue)
      }
    });
  } catch (err) {
    console.error('Fetch Revenue Error:', err);
    res.status(500).json({ success: false, message: 'Server error compiling revenue details' });
  }
});

// @route   GET /api/dashboard/chart
// @desc    Get weekly appointments performance analytics (Recharts compatible format)
router.get('/chart', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT to_char(appointment_date, 'Dy') as day_name,
              COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_count,
              COUNT(CASE WHEN status = 'Missed' THEN 1 END) as missed_count,
              COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelled_count
       FROM appointments
       WHERE doctor_id = $1 AND appointment_date >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY appointment_date
       ORDER BY appointment_date ASC`,
      [req.user.id]
    );

    const formattedData = result.rows.map(row => ({
      name: row.day_name,
      Completed: parseInt(row.completed_count || '0'),
      Missed: parseInt(row.missed_count || '0') + parseInt(row.cancelled_count || '0')
    }));

    res.status(200).json({
      success: true,
      chartData: formattedData
    });
  } catch (err) {
    console.error('Fetch Chart Data Error:', err);
    res.status(500).json({ success: false, message: 'Server error compiling chart statistics' });
  }
});

export default router;
