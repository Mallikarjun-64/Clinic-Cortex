import express from 'express';
import { query } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';
import { authenticateToken } from '../middleware/auth.js';
import { signupValidationRules, loginValidationRules } from '../middleware/validate.js';

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new doctor account
router.post('/signup', signupValidationRules, async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    // 1. Check if email already registered
    const existing = await query(
      'SELECT id FROM doctors WHERE professional_email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A doctor with this professional email is already registered.'
      });
    }

    // 2. Hash the user password
    const hashed = await hashPassword(password);

    // 3. Insert record into database
    const result = await query(
      `INSERT INTO doctors (first_name, last_name, professional_email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, first_name, last_name, professional_email`,
      [firstName, lastName, email, hashed]
    );

    const newDoctor = result.rows[0];

    // 4. Generate Authorization Token
    const token = generateToken({ id: newDoctor.id, email: newDoctor.professional_email });

    res.status(201).json({
      success: true,
      token,
      doctor: {
        id: newDoctor.id,
        firstName: newDoctor.first_name,
        lastName: newDoctor.last_name,
        email: newDoctor.professional_email
      }
    });

  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ success: false, message: 'Server error during signup process' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate doctor credentials and issue token
router.post('/login', loginValidationRules, async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Retrieve doctor account
    const result = await query(
      'SELECT id, first_name, last_name, professional_email, password_hash FROM doctors WHERE professional_email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const doctor = result.rows[0];

    // 2. Match password hash
    const isMatch = await comparePassword(password, doctor.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    // 3. Issue Token
    const token = generateToken({ id: doctor.id, email: doctor.professional_email });

    res.status(200).json({
      success: true,
      token,
      doctor: {
        id: doctor.id,
        firstName: doctor.first_name,
        lastName: doctor.last_name,
        email: doctor.professional_email
      }
    });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, message: 'Server error during login process' });
  }
});

// @route   GET /api/auth/me
// @desc    Retrieve authenticated doctor metadata
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, first_name, last_name, professional_email, pg_specialization, experience_years FROM doctors WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const doctor = result.rows[0];

    res.status(200).json({
      success: true,
      doctor: {
        id: doctor.id,
        firstName: doctor.first_name,
        lastName: doctor.last_name,
        email: doctor.professional_email,
        specialization: doctor.pg_specialization,
        experience: doctor.experience_years
      }
    });

  } catch (err) {
    console.error('Get Me Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving credentials context' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout placeholder
router.post('/logout', (req, res) => {
  res.status(200).json({ success: true, message: 'Logout successful' });
});

export default router;
