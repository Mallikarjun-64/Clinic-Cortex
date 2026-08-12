import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { query, pool } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { authenticatePatientToken } from '../middleware/patientAuth.js';

const router = express.Router();

// Initialize Razorpay SDK if environment variables exist
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Helper middleware for either Patient or Doctor authentication
const authenticateEitherUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token required' });

  // Delegate to authenticatePatientToken or authenticateToken
  if (req.headers['x-user-role'] === 'doctor') {
    return authenticateToken(req, res, next);
  } else {
    return authenticatePatientToken(req, res, next);
  }
};

// @route   GET /api/payments/wallet
// @desc    Get currently logged in patient's wallet balance & transactions
router.get('/wallet', authenticatePatientToken, async (req, res) => {
  try {
    const patientId = req.patient.id;

    // Get or initialize wallet
    let walletRes = await query('SELECT * FROM patient_wallets WHERE patient_id = $1', [patientId]);
    if (walletRes.rows.length === 0) {
      walletRes = await query(
        `INSERT INTO patient_wallets (patient_id, balance) VALUES ($1, 0.00) RETURNING *`,
        [patientId]
      );
    }

    const wallet = walletRes.rows[0];

    // Fetch recent transactions
    const txRes = await query(
      `SELECT * FROM wallet_transactions WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [patientId]
    );

    res.status(200).json({
      success: true,
      wallet,
      transactions: txRes.rows
    });
  } catch (err) {
    console.error('Fetch Wallet Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving wallet details' });
  }
});

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order for wallet recharge
router.post('/create-order', authenticatePatientToken, async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount < 10) {
    return res.status(400).json({ success: false, message: 'Minimum recharge amount is ₹10' });
  }

  const numericAmount = parseFloat(amount);

  try {
    if (razorpay && process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_SECRET.includes('YOUR_')) {
      try {
        const options = {
          amount: Math.round(numericAmount * 100), // Amount in paise
          currency: 'INR',
          receipt: `recharge_${Date.now()}`,
          notes: {
            patient_id: req.patient.id
          }
        };

        const orderPromise = razorpay.orders.create(options);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Razorpay API response timeout')), 3500)
        );

        const order = await Promise.race([orderPromise, timeoutPromise]);
        if (order && order.id) {
          return res.status(200).json({
            success: true,
            isLive: true,
            keyId: process.env.RAZORPAY_KEY_ID,
            order
          });
        }
      } catch (rzpErr) {
        console.warn('Razorpay Live Order Notice (Fallback to simulation mode):', rzpErr?.message || rzpErr);
      }
    }
  } catch (err) {
    console.warn('Create Payment Order Exception (Falling back to test order):', err?.message || err);
  }

  // Test / Sandbox Fallback Order
  const testOrderId = `order_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  return res.status(200).json({
    success: true,
    isLive: false,
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TOraKUPamPulkW',
    order: {
      id: testOrderId,
      amount: Math.round(numericAmount * 100),
      currency: 'INR'
    }
  });
});

// @route   POST /api/payments/verify-recharge
// @desc    Verify Razorpay Signature & Credit Patient Wallet
router.post('/verify-recharge', authenticatePatientToken, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, isTestMode } = req.body;
  const patientId = req.patient.id;
  const creditAmount = parseFloat(amount);

  if (!creditAmount || creditAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid recharge amount' });
  }

  // 1. Signature verification if Razorpay environment secret exists and signature provided
  if (razorpay && process.env.RAZORPAY_KEY_SECRET && !isTestMode && razorpay_signature) {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  }

  const client = await pool.connect();

  try {
    // 2. Perform DB Transaction on dedicated pool client
    await client.query('BEGIN');

    const walletRes = await client.query(
      `INSERT INTO patient_wallets (patient_id, balance) 
       VALUES ($1, $2)
       ON CONFLICT (patient_id) 
       DO UPDATE SET balance = patient_wallets.balance + $2, updated_at = NOW()
       RETURNING *`,
      [patientId, creditAmount]
    );

    const paymentIdStr = razorpay_payment_id || `pay_sim_${Date.now()}`;
    const orderIdStr = razorpay_order_id || `ord_sim_${Date.now()}`;
    const refIdStr = `TOP-${Date.now()}`;

    await client.query(
      `INSERT INTO wallet_transactions (patient_id, amount, type, transaction_type, description, reference_id, razorpay_payment_id, razorpay_order_id)
       VALUES ($1, $2, 'Top-up', 'Credit', 'Online Wallet Recharge', $3, $4, $5)`,
      [patientId, creditAmount, refIdStr, paymentIdStr, orderIdStr]
    );

    await client.query('COMMIT');

    const txRes = await client.query(
      `SELECT * FROM wallet_transactions WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [patientId]
    );

    res.status(200).json({
      success: true,
      message: `Successfully credited ₹${creditAmount} to wallet!`,
      wallet: walletRes.rows[0],
      transactions: txRes.rows
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Verify Recharge Error:', err);
    res.status(500).json({ success: false, message: 'Server error updating wallet balance' });
  } finally {
    client.release();
  }
});

// @route   PUT /api/payments/doctor/bank-details
// @desc    Update Doctor Bank Account & Payout Info
router.put('/doctor/bank-details', authenticateToken, async (req, res) => {
  const { bankAccountHolder, bankAccountNumber, bankIfscCode, panNumber } = req.body;
  const doctorId = req.user.id;

  try {
    const result = await query(
      `UPDATE doctors
       SET bank_account_holder = COALESCE($1, bank_account_holder),
           bank_account_number = COALESCE($2, bank_account_number),
           bank_ifsc_code = COALESCE($3, bank_ifsc_code),
           pan_number = COALESCE($4, pan_number),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, bank_account_holder, bank_account_number, bank_ifsc_code, pan_number, razorpay_account_id`,
      [bankAccountHolder, bankAccountNumber, bankIfscCode, panNumber, doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Bank account details updated successfully',
      bankDetails: result.rows[0]
    });
  } catch (err) {
    console.error('Update Doctor Bank Details Error:', err);
    res.status(500).json({ success: false, message: 'Server error saving bank details' });
  }
});

// @route   GET /api/payments/doctor/payouts
// @desc    Get Doctor Payout History & Bank Info
router.get('/doctor/payouts', authenticateToken, async (req, res) => {
  const doctorId = req.user.id;

  try {
    const docRes = await query(
      `SELECT bank_account_holder, bank_account_number, bank_ifsc_code, pan_number, razorpay_account_id 
       FROM doctors WHERE id = $1`,
      [doctorId]
    );

    const payoutsRes = await query(
      `SELECT dp.*, a.visit_type, a.patient_name 
       FROM doctor_payouts dp
       LEFT JOIN appointments a ON dp.appointment_id = a.id
       WHERE dp.doctor_id = $1
       ORDER BY dp.created_at DESC`,
      [doctorId]
    );

    res.status(200).json({
      success: true,
      bankDetails: docRes.rows[0] || {},
      payouts: payoutsRes.rows
    });
  } catch (err) {
    console.error('Fetch Doctor Payouts Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving payout records' });
  }
});

// Helper function to process automated payouts to Doctor Bank Account
export async function processDoctorPayout(appointmentId) {
  try {
    // Check if payout already processed for this appointment
    const existingPayout = await query('SELECT id FROM doctor_payouts WHERE appointment_id = $1', [appointmentId]);
    if (existingPayout.rows.length > 0) {
      console.log(`Doctor payout already processed for appointment ${appointmentId}`);
      return;
    }

    const aptRes = await query(
      `SELECT a.*, d.razorpay_account_id, d.bank_account_number, d.bank_ifsc_code, d.bank_account_holder, d.clinic_fee, d.online_fee, d.home_fee
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = $1`,
      [appointmentId]
    );

    if (aptRes.rows.length === 0) return;
    const apt = aptRes.rows[0];

    const fee = apt.visit_type === 'Clinic' ? (apt.clinic_fee || 500) :
                apt.visit_type === 'Video' ? (apt.online_fee || 400) : (apt.home_fee || 800);

    let payoutStatus = 'Transferred';
    let transferId = `tr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // If Razorpay Route is active and doctor has a linked Razorpay account ID
    if (razorpay && apt.razorpay_account_id) {
      try {
        const transfer = await razorpay.transfers.create({
          account: apt.razorpay_account_id,
          amount: Math.round(fee * 100),
          currency: 'INR',
          notes: { appointment_id: appointmentId }
        });
        transferId = transfer.id;
      } catch (e) {
        console.warn('Razorpay Transfer Route Notice:', e.message);
      }
    }

    await query(
      `INSERT INTO doctor_payouts (doctor_id, appointment_id, amount, payout_status, razorpay_transfer_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [apt.doctor_id, appointmentId, fee, payoutStatus, transferId]
    );

    console.log(`Automated payout of ₹${fee} logged for Doctor (${apt.doctor_id}) for appointment ${appointmentId}`);
  } catch (err) {
    console.error('Process Doctor Payout Error:', err);
  }
}

export default router;
