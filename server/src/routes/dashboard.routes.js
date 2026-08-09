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
// @desc    Get real monthly revenue calculations
router.get('/revenue', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
         COALESCE(SUM(CASE WHEN a.visit_type = 'Clinic' THEN COALESCE(d.clinic_fee, 500) ELSE 0 END), 0) as clinic_revenue,
         COALESCE(SUM(CASE WHEN a.visit_type = 'Video' THEN COALESCE(d.online_fee, 400) ELSE 0 END), 0) as online_revenue,
         COALESCE(SUM(CASE WHEN a.visit_type = 'Home' THEN COALESCE(d.home_fee, 800) ELSE 0 END), 0) as home_revenue
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       WHERE a.doctor_id = $1 AND a.status = 'Completed'`,
      [req.user.id]
    );

    const stats = result.rows[0] || {};
    const clinic = parseFloat(stats.clinic_revenue || 0);
    const online = parseFloat(stats.online_revenue || 0);
    const home = parseFloat(stats.home_revenue || 0);
    const total = clinic + online + home;

    res.status(200).json({
      success: true,
      revenue: {
        clinic,
        online,
        home,
        total
      }
    });
  } catch (err) {
    console.error('Fetch Revenue Error:', err);
    res.status(500).json({ success: false, message: 'Server error compiling revenue details' });
  }
});

// @route   GET /api/dashboard/scrutiny
// @desc    Get real dynamic doctor scrutiny & pending action items
router.get('/scrutiny', authenticateToken, async (req, res) => {
  try {
    const doctorId = req.user.id;

    // 1. Pending Consultation Requests
    const pendingReqs = await query(
      `SELECT COUNT(*) FROM consultation_requests WHERE doctor_id = $1 AND status = 'Pending'`,
      [doctorId]
    );

    // 2. Waiting Patient Appointments
    const waitingAppts = await query(
      `SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND status = 'Waiting'`,
      [doctorId]
    );

    // 3. Unread Patient Messages
    const unreadMsgs = await query(
      `SELECT COUNT(*) FROM messages WHERE doctor_id = $1 AND sender_role = 'patient' AND is_read = false`,
      [doctorId]
    );

    // 4. Patient Record Updates
    const recordUpdates = await query(
      `SELECT COUNT(*) FROM medical_records mr 
       JOIN appointments a ON mr.patient_id = a.patient_id 
       WHERE a.doctor_id = $1 AND mr.created_at >= NOW() - INTERVAL '7 days'`,
      [doctorId]
    );

    const items = [
      { id: '1', label: 'Consultation Requests', count: parseInt(pendingReqs.rows[0].count || '0'), status: 'Pending' },
      { id: '2', label: 'Waiting Patient Appointments', count: parseInt(waitingAppts.rows[0].count || '0'), status: 'Waiting' },
      { id: '3', label: 'Unread Patient Inquiries', count: parseInt(unreadMsgs.rows[0].count || '0'), status: 'Action Needed' },
      { id: '4', label: 'Patient Record Updates', count: parseInt(recordUpdates.rows[0].count || '0'), status: 'Recent' }
    ];

    res.status(200).json({
      success: true,
      items
    });
  } catch (err) {
    console.error('Fetch Scrutiny Error:', err);
    res.status(500).json({ success: false, message: 'Server error compiling scrutiny details' });
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
