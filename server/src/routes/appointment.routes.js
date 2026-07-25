import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { appointmentValidationRules } from '../middleware/validate.js';
import { verifyToken, verifyPatientToken } from '../utils/jwt.js';

const router = express.Router();

// Custom middleware to authenticate either Doctor or Patient token
const authenticateEitherUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Missing authentication token'
    });
  }

  // 1. Try Doctor token first
  try {
    const decodedDoctor = verifyToken(token);
    req.user = decodedDoctor;
    req.isDoctor = true;
    return next();
  } catch (err) {
    // Doctor token verification failed, try patient token
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
      message: 'Access Denied: Invalid or expired authentication token'
    });
  }
};

// @route   GET /api/appointments
// @desc    List appointments for the logged-in doctor or patient, with tabs/filters
router.get('/', authenticateEitherUser, async (req, res) => {
  const { tab, type, date, search } = req.query;

  try {
    let sql;
    let params;

    if (req.isDoctor) {
      sql = 'SELECT a.* FROM appointments a WHERE a.doctor_id = $1';
      params = [req.user.id];
    } else {
      sql = `SELECT a.*, 
                    CONCAT(d.salutation, ' ', d.first_name, ' ', d.last_name) as doctor_name,
                    d.pg_specialization as doctor_specialization,
                    d.profile_photo_url as doctor_avatar
             FROM appointments a 
             LEFT JOIN doctors d ON a.doctor_id = d.id 
             WHERE a.patient_id = $1`;
      params = [req.patient.id];
    }

    // Filter by tab status groups
    if (tab) {
      if (tab === 'upcoming') {
        params.push('Confirmed');
        params.push('Scheduled');
        params.push('Waiting');
        sql += ` AND a.status IN ($${params.length - 2}, $${params.length - 1}, $${params.length})`;
      } else if (tab === 'completed') {
        params.push('Completed');
        sql += ` AND a.status = $${params.length}`;
      } else if (tab === 'missed') {
        params.push('Missed');
        params.push('Cancelled');
        sql += ` AND a.status IN ($${params.length - 1}, $${params.length})`;
      } else {
        params.push(tab);
        sql += ` AND a.status = $${params.length}`;
      }
    }

    // Filter by visit type (Clinic, Video, Home)
    if (type) {
      params.push(type);
      sql += ` AND a.visit_type = $${params.length}`;
    }

    // Filter by appointment date
    if (date) {
      params.push(date);
      sql += ` AND a.appointment_date = $${params.length}`;
    }

    // Search by patient name or condition
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (a.patient_name ILIKE $${params.length} OR a.condition ILIKE $${params.length})`;
    }

    sql += ' ORDER BY a.appointment_date ASC, a.appointment_time ASC';

    const result = await query(sql, params);
    res.status(200).json({ success: true, count: result.rows.length, appointments: result.rows });
  } catch (err) {
    console.error('List Appointments Error:', err);
    res.status(500).json({ success: false, message: 'Server error listing appointments' });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get detailed record of a single appointment
router.get('/:id', authenticateEitherUser, async (req, res) => {
  const { id } = req.params;

  try {
    let sql;
    let params;

    if (req.isDoctor) {
      sql = 'SELECT * FROM appointments WHERE id = $1 AND doctor_id = $2';
      params = [id, req.user.id];
    } else {
      sql = `SELECT a.*, 
                    CONCAT(d.salutation, ' ', d.first_name, ' ', d.last_name) as doctor_name,
                    d.pg_specialization as doctor_specialization,
                    d.profile_photo_url as doctor_avatar
             FROM appointments a 
             LEFT JOIN doctors d ON a.doctor_id = d.id 
             WHERE a.id = $1 AND a.patient_id = $2`;
      params = [id, req.patient.id];
    }

    const result = await query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    res.status(200).json({ success: true, appointment: result.rows[0] });
  } catch (err) {
    console.error('Fetch Appointment Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving appointment' });
  }
});

// @route   POST /api/appointments
// @desc    Create a new appointment slot booking (Doctor or Patient caller)
router.post('/', authenticateEitherUser, appointmentValidationRules, async (req, res) => {
  const { doctorId, patientId, patientName, patientAge, visitType, date, time, condition, notes, vitals } = req.body;

  try {
    let finalDoctorId;
    let finalPatientId;
    let finalPatientName = patientName;
    let finalPatientAge = patientAge;

    if (req.isDoctor) {
      // Doctor request: doctor_id comes from authenticated doctor token, patientId comes from req.body
      finalDoctorId = req.user.id;
      finalPatientId = patientId || null;

      if (patientId) {
        const patientCheck = await query('SELECT name, age FROM patients WHERE id = $1', [patientId]);
        if (patientCheck.rows.length > 0) {
          finalPatientName = patientCheck.rows[0].name;
          finalPatientAge = patientCheck.rows[0].age;
        }
      }
    } else if (req.isPatient) {
      // Patient request: doctor_id comes from req.body.doctorId
      if (!doctorId) {
        return res.status(400).json({ success: false, message: 'doctorId is required' });
      }

      // Validate doctorId exists in doctors table
      const doctorCheck = await query('SELECT id FROM doctors WHERE id = $1', [doctorId]);
      if (doctorCheck.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }

      finalDoctorId = doctorId;
      finalPatientId = req.patient.id; // Patient's own authenticated ID

      // Retrieve patient's name and age from DB if not provided
      const patientInfo = await query('SELECT name, age FROM patients WHERE id = $1', [req.patient.id]);
      if (patientInfo.rows.length > 0) {
        if (!finalPatientName) finalPatientName = patientInfo.rows[0].name;
        if (!finalPatientAge) finalPatientAge = patientInfo.rows[0].age;
      }
    }

    // Perform insertion
    const result = await query(
      `INSERT INTO appointments (doctor_id, patient_id, patient_name, patient_age, visit_type, appointment_date, appointment_time, status, condition, notes, vitals)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Scheduled', $8, $9, $10)
       RETURNING *`,
      [
        finalDoctorId,
        finalPatientId,
        finalPatientName,
        finalPatientAge,
        visitType,
        date,
        time,
        condition || 'General Consult',
        notes || null,
        vitals || '{}'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Appointment scheduled successfully',
      appointment: result.rows[0]
    });
  } catch (err) {
    console.error('Create Appointment Error:', err);
    res.status(500).json({ success: false, message: 'Server error scheduling appointment' });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Reschedule/update details of an appointment
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { date, time, visitType, condition, notes, vitals } = req.body;

  try {
    const check = await query('SELECT id FROM appointments WHERE id = $1 AND doctor_id = $2', [id, req.user.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const result = await query(
      `UPDATE appointments
       SET appointment_date = COALESCE($1, appointment_date),
           appointment_time = COALESCE($2, appointment_time),
           visit_type = COALESCE($3, visit_type),
           condition = COALESCE($4, condition),
           notes = COALESCE($5, notes),
           vitals = COALESCE($6, vitals),
           updated_at = NOW()
       WHERE id = $7 AND doctor_id = $8
       RETURNING *`,
      [date, time, visitType, condition, notes, vitals, id, req.user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled/updated successfully',
      appointment: result.rows[0]
    });
  } catch (err) {
    console.error('Update Appointment Error:', err);
    res.status(500).json({ success: false, message: 'Server error updating appointment' });
  }
});

// @route   PATCH /api/appointments/:id/status
// @desc    Quick update status (Scheduled, Confirmed, Waiting, Completed, Cancelled, Missed)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }

  try {
    const result = await query(
      `UPDATE appointments
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND doctor_id = $3
       RETURNING *`,
      [status, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      appointment: result.rows[0]
    });
  } catch (err) {
    console.error('Patch Status Error:', err);
    res.status(500).json({ success: false, message: 'Server error updating appointment status' });
  }
});

export default router;
