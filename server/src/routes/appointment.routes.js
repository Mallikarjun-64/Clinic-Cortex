import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { appointmentValidationRules, validateUuidParam } from '../middleware/validate.js';
import { verifyToken, verifyPatientToken } from '../utils/jwt.js';
import { processDoctorPayout } from './payment.routes.js';

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

      // Check Doctor Fees
      const docRes = await query('SELECT clinic_fee, online_fee, home_fee FROM doctors WHERE id = $1', [doctorId]);
      const doc = docRes.rows[0] || {};
      const fee = visitType === 'Clinic' ? parseFloat(doc.clinic_fee || 500) :
                  visitType === 'Video' ? parseFloat(doc.online_fee || 400) : parseFloat(doc.home_fee || 800);

      // Check Patient Wallet Balance
      const walletRes = await query('SELECT balance FROM patient_wallets WHERE patient_id = $1', [req.patient.id]);
      const currentBalance = walletRes.rows.length > 0 ? parseFloat(walletRes.rows[0].balance || 0) : 0;

      if (currentBalance < fee) {
        return res.status(400).json({
          success: false,
          message: `Insufficient wallet balance (Available: ₹${currentBalance.toFixed(2)}). Consultation fee is ₹${fee.toFixed(2)}. Please recharge your digital wallet.`
        });
      }

      // Deduct fee upfront from Patient Wallet
      await query('UPDATE patient_wallets SET balance = balance - $1, updated_at = NOW() WHERE patient_id = $2', [fee, req.patient.id]);
      await query(
        `INSERT INTO wallet_transactions (patient_id, type, transaction_type, amount, description)
         VALUES ($1, 'Booking', 'Debit', $2, $3)`,
        [req.patient.id, fee, `Consultation Booking Fee (${visitType || 'General'})`]
      );

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
router.put('/:id', authenticateEitherUser, async (req, res) => {
  const { id } = req.params;
  const { date, time, visitType, condition, notes, vitals, status } = req.body;

  try {
    let checkSql = 'SELECT id FROM appointments WHERE id = $1';
    let checkParams = [id];
    if (req.isDoctor) {
      checkSql += ' AND (doctor_id = $2 OR doctor_id IS NULL)';
      checkParams.push(req.user.id);
    } else if (req.isPatient) {
      checkSql += ' AND (patient_id = $2 OR patient_id IS NULL)';
      checkParams.push(req.patient.id);
    }

    const check = await query(checkSql, checkParams);
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
           status = COALESCE($7, status),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        date || null,
        time || null,
        visitType || null,
        condition || null,
        notes || null,
        vitals ? (typeof vitals === 'string' ? vitals : JSON.stringify(vitals)) : null,
        status || null,
        id
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: result.rows[0]
    });
  } catch (err) {
    console.error('Update Appointment Error:', err);
    res.status(500).json({ success: false, message: 'Server error updating appointment' });
  }
});

// @route   PATCH /api/appointments/:id/status
// @desc    Quick update status (Scheduled, Confirmed, Waiting, Completed, Cancelled, Missed)
router.patch('/:id/status', authenticateEitherUser, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }

  try {
    const result = await query(
      `UPDATE appointments
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const updatedApt = result.rows[0];

    // If appointment is completed or cancelled, automatically mark video call notifications as read
    if (status === 'Completed' || status === 'Cancelled') {
      await query(
        `UPDATE notifications
         SET is_read = true
         WHERE appointment_id = $1 OR (patient_id = $2 AND notification_type = 'video_call')`,
        [id, updatedApt.patient_id]
      ).catch((e) => console.warn('Notification auto-read error', e));

      if (status === 'Completed') {
        processDoctorPayout(id).catch((e) => console.warn('Doctor payout trigger error', e));
      } else if (status === 'Cancelled' && updatedApt.patient_id) {
        // Refund fee to patient wallet upon cancellation
        (async () => {
          try {
            const docRes = await query('SELECT clinic_fee, online_fee, home_fee FROM doctors WHERE id = $1', [updatedApt.doctor_id]);
            const doc = docRes.rows[0] || {};
            const refundFee = updatedApt.visit_type === 'Clinic' ? parseFloat(doc.clinic_fee || 500) :
                              updatedApt.visit_type === 'Video' ? parseFloat(doc.online_fee || 400) : parseFloat(doc.home_fee || 800);

            await query('UPDATE patient_wallets SET balance = balance + $1, updated_at = NOW() WHERE patient_id = $2', [refundFee, updatedApt.patient_id]);
            await query(
              `INSERT INTO wallet_transactions (patient_id, type, transaction_type, amount, description)
               VALUES ($1, 'Refund', 'Credit', $2, $3)`,
              [updatedApt.patient_id, refundFee, `Appointment Cancellation Refund (${updatedApt.visit_type || 'General'})`]
            );
          } catch (refundErr) {
            console.warn('Refund processing notice:', refundErr.message);
          }
        })();
      }
    }

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      appointment: updatedApt
    });
  } catch (err) {
    console.error('Patch Status Error:', err);
    res.status(500).json({ success: false, message: 'Server error updating appointment status' });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Delete an appointment by ID
router.delete('/:id', authenticateEitherUser, validateUuidParam, async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Delete associated notifications first for foreign key integrity
    await query('DELETE FROM notifications WHERE appointment_id = $1', [id]).catch(() => {});

    // 2. Delete appointment
    const result = await query(
      `DELETE FROM appointments
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
      deletedAppointment: result.rows[0]
    });
  } catch (err) {
    console.error('Delete Appointment Error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting appointment' });
  }
});

export default router;
