import express from 'express';
import { query } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generatePatientToken } from '../utils/jwt.js';
import { authenticatePatientToken } from '../middleware/patientAuth.js';

const router = express.Router();

// @route   POST /api/patient-auth/signup
// @desc    Register a new patient account
router.post('/signup', async (req, res) => {
  const { name, age, gender, email, phone, password, income, language, address } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }

  try {
    // 1. Check existing patient
    const existing = await query('SELECT id FROM patients WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A patient account with this email already exists'
      });
    }

    // 2. Hash password
    const hashed = await hashPassword(password);

    // 3. Insert patient
    const result = await query(
      `INSERT INTO patients (name, age, gender, email, phone, address, password_hash, annual_income, preferred_language)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        name,
        age ? parseInt(age, 10) : null,
        gender || 'Other',
        email,
        phone || null,
        address || null,
        hashed,
        income ? parseFloat(income) : 0,
        language || 'English'
      ]
    );

    const patient = result.rows[0];
    delete patient.password_hash;

    // 4. Create default patient wallet
    await query(
      `INSERT INTO patient_wallets (patient_id, balance, currency, subscription_status)
       VALUES ($1, 0.00, 'INR', 'Free')
       ON CONFLICT (patient_id) DO NOTHING`,
      [patient.id]
    );

    // 5. Generate token
    const token = generatePatientToken({ id: patient.id, email: patient.email });

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      token,
      patient
    });
  } catch (err) {
    console.error('Patient Signup Error:', err);
    res.status(500).json({ success: false, message: 'Server error registering patient' });
  }
});

// @route   POST /api/patient-auth/login
// @desc    Authenticate patient & return JWT
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password'
    });
  }

  try {
    const result = await query('SELECT * FROM patients WHERE LOWER(email) = LOWER($1)', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const patient = result.rows[0];

    if (!patient.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'No password set for this account. Please register first.'
      });
    }

    const isMatch = await comparePassword(password, patient.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    delete patient.password_hash;
    const token = generatePatientToken({ id: patient.id, email: patient.email });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      patient
    });
  } catch (err) {
    console.error('Patient Login Error:', err);
    res.status(500).json({ success: false, message: 'Server error authenticating patient' });
  }
});

// @route   GET /api/patient-auth/me
// @desc    Get currently logged in patient details
router.get('/me', authenticatePatientToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM patients WHERE id = $1', [req.patient.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const patient = result.rows[0];
    delete patient.password_hash;

    const walletResult = await query('SELECT * FROM patient_wallets WHERE patient_id = $1', [req.patient.id]);
    const wallet = walletResult.rows[0] || { balance: 0.00, currency: 'INR', subscription_status: 'Free' };

    res.status(200).json({
      success: true,
      patient,
      wallet
    });
  } catch (err) {
    console.error('Patient Me Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving profile' });
  }
});

export default router;
