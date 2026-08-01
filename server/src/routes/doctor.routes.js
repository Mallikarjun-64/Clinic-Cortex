import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { hashPassword } from '../utils/hash.js';

const router = express.Router();

// @route   GET /api/doctors/profile
// @desc    Retrieve the complete profile of the logged-in doctor
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM doctors WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found.'
      });
    }

    const doctor = result.rows[0];
    // Remove sensitive hash from client response
    delete doctor.password_hash;

    res.status(200).json({
      success: true,
      profile: doctor
    });
  } catch (err) {
    console.error('Fetch Profile Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving doctor profile' });
  }
});

// @route   PUT /api/doctors/profile
// @desc    Update editable doctor profile details
router.put('/profile', authenticateToken, async (req, res) => {
  const {
    salutation, firstName, middleName, lastName, dob, gender, nationality,
    mobile, whatsapp, personalEmail, clinicAddress, homeAddress, city, state,
    pincode, gpsPin, nmcRegNo, smcName, regType, regYear, regExpiry,
    mbbsUniversity, mbbsYear, pgDegree, pgSpecialization, superSpecialization,
    additionalCerts, experienceYears, clinicFee, onlineFee, bio, bankName,
    bankAccountNo, bankIfsc, gstNo, emergencyName, emergencyRelation, emergencyPhone
  } = req.body;

  try {
    const result = await query(
      `UPDATE doctors
       SET salutation = COALESCE($1, salutation),
           first_name = COALESCE($2, first_name),
           middle_name = COALESCE($3, middle_name),
           last_name = COALESCE($4, last_name),
           dob = COALESCE($5, dob),
           gender = COALESCE($6, gender),
           nationality = COALESCE($7, nationality),
           mobile = COALESCE($8, mobile),
           whatsapp = COALESCE($9, whatsapp),
           personal_email = COALESCE($10, personal_email),
           clinic_address = COALESCE($11, clinic_address),
           home_address = COALESCE($12, home_address),
           city = COALESCE($13, city),
           state = COALESCE($14, state),
           pincode = COALESCE($15, pincode),
           gps_pin = COALESCE($16, gps_pin),
           nmc_reg_no = COALESCE($17, nmc_reg_no),
           smc_name = COALESCE($18, smc_name),
           reg_type = COALESCE($19, reg_type),
           reg_year = COALESCE($20, reg_year),
           reg_expiry = COALESCE($21, reg_expiry),
           mbbs_university = COALESCE($22, mbbs_university),
           mbbs_year = COALESCE($23, mbbs_year),
           pg_degree = COALESCE($24, pg_degree),
           pg_specialization = COALESCE($25, pg_specialization),
           super_specialization = COALESCE($26, super_specialization),
           additional_certs = COALESCE($27, additional_certs),
           experience_years = COALESCE($28, experience_years),
           clinic_fee = COALESCE($29, clinic_fee),
           online_fee = COALESCE($30, online_fee),
           bio = COALESCE($31, bio),
           bank_name = COALESCE($32, bank_name),
           bank_account_no = COALESCE($33, bank_account_no),
           bank_ifsc = COALESCE($34, bank_ifsc),
           gst_no = COALESCE($35, gst_no),
           emergency_name = COALESCE($36, emergency_name),
           emergency_relation = COALESCE($37, emergency_relation),
           emergency_phone = COALESCE($38, emergency_phone),
           updated_at = NOW()
       WHERE id = $39
       RETURNING *`,
      [
        salutation, firstName, middleName, lastName, dob, gender, nationality,
        mobile, whatsapp, personalEmail, clinicAddress, homeAddress, city, state,
        pincode, gpsPin, nmcRegNo, smcName, regType, regYear, regExpiry,
        mbbsUniversity, mbbsYear, pgDegree, pgSpecialization, superSpecialization,
        additionalCerts, experienceYears, clinicFee, onlineFee, bio, bankName,
        bankAccountNo, bankIfsc, gstNo, emergencyName, emergencyRelation, emergencyPhone,
        req.user.id
      ]
    );

    const updatedProfile = result.rows[0];
    delete updatedProfile.password_hash;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ success: false, message: 'Server error updating doctor profile' });
  }
});

// @route   PUT /api/doctors/password
// @desc    Change password of the logged-in doctor
router.put('/password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long.'
    });
  }

  try {
    // 1. Fetch current password hash
    const result = await query(
      'SELECT password_hash FROM doctors WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const { password_hash } = result.rows[0];

    // 2. Validate current password
    const isMatch = await comparePassword(oldPassword, password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Old password is incorrect.' });
    }

    // 3. Hash and store new password
    const hashed = await hashPassword(newPassword);
    await query(
      'UPDATE doctors SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashed, req.user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error('Change Password Error:', err);
    res.status(500).json({ success: false, message: 'Server error changing password' });
  }
});

export default router;
