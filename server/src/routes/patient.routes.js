import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/patients
// @desc    List all patients with optional search queries
router.get('/', authenticateToken, async (req, res) => {
  const { search, condition } = req.query;
  
  try {
    let sql = 'SELECT * FROM patients';
    const params = [];
    const conditions = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR condition ILIKE $${params.length} OR phone ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }

    if (condition && condition !== 'all') {
      params.push(`%${condition}%`);
      conditions.push(`condition ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY name ASC';

    const result = await query(sql, params);
    res.status(200).json({ success: true, count: result.rows.length, patients: result.rows });
  } catch (err) {
    console.error('List Patients Error:', err);
    res.status(500).json({ success: false, message: 'Server error listing patients' });
  }
});

// @route   GET /api/patients/:id
// @desc    Get detailed record of a single patient
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query('SELECT * FROM patients WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.status(200).json({ success: true, patient: result.rows[0] });
  } catch (err) {
    console.error('Fetch Patient Detail Error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching patient details' });
  }
});

// @route   POST /api/patients
// @desc    Create/Add a new patient record
router.post('/', authenticateToken, async (req, res) => {
  const { name, age, gender, dob, phone, email, address, condition } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Patient name is required.' });
  }

  try {
    const result = await query(
      `INSERT INTO patients (name, age, gender, dob, phone, email, address, condition)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, age, gender, dob, phone, email, address, condition]
    );

    res.status(201).json({
      success: true,
      message: 'Patient record created successfully',
      patient: result.rows[0]
    });
  } catch (err) {
    console.error('Create Patient Error:', err);
    res.status(500).json({ success: false, message: 'Server error creating patient record' });
  }
});

// @route   PUT /api/patients/:id
// @desc    Update editable properties of a patient record
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, age, gender, dob, phone, email, address, condition } = req.body;

  try {
    const checkResult = await query('SELECT id FROM patients WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const result = await query(
      `UPDATE patients
       SET name = COALESCE($1, name),
           age = COALESCE($2, age),
           gender = COALESCE($3, gender),
           dob = COALESCE($4, dob),
           phone = COALESCE($5, phone),
           email = COALESCE($6, email),
           address = COALESCE($7, address),
           condition = COALESCE($8, condition),
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [name, age, gender, dob, phone, email, address, condition, id]
    );

    res.status(200).json({
      success: true,
      message: 'Patient record updated successfully',
      patient: result.rows[0]
    });
  } catch (err) {
    console.error('Update Patient Error:', err);
    res.status(500).json({ success: false, message: 'Server error updating patient record' });
  }
});

// @route   DELETE /api/patients/:id
// @desc    Remove a patient record
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query('DELETE FROM patients WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.status(200).json({ success: true, message: 'Patient record deleted successfully' });
  } catch (err) {
    console.error('Delete Patient Error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting patient record' });
  }
});

// @route   GET /api/patients/:id/records
// @desc    Get clinical history records of a patient
router.get('/:id/records', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(
      'SELECT * FROM medical_records WHERE patient_id = $1 ORDER BY record_date DESC',
      [id]
    );
    res.status(200).json({ success: true, count: result.rows.length, records: result.rows });
  } catch (err) {
    console.error('Fetch Patient Records Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving clinical history' });
  }
});

// @route   GET /api/patients/:id/prescriptions
// @desc    Get written prescription logs of a patient
router.get('/:id/prescriptions', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(
      'SELECT * FROM prescriptions WHERE patient_id = $1 ORDER BY prescribed_date DESC',
      [id]
    );
    res.status(200).json({ success: true, count: result.rows.length, prescriptions: result.rows });
  } catch (err) {
    console.error('Fetch Patient Prescriptions Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving prescriptions' });
  }
});

export default router;
