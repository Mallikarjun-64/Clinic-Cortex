import express from 'express';
import { query, pool } from '../config/db.js';
import { authenticatePatientToken } from '../middleware/patientAuth.js';

const router = express.Router();

// @route   GET /api/wallet
// @desc    Get logged in patient's wallet balance and active subscription info
router.get('/', authenticatePatientToken, async (req, res) => {
  try {
    let result = await query('SELECT * FROM patient_wallets WHERE patient_id = $1', [req.patient.id]);
    
    if (result.rows.length === 0) {
      result = await query(
        `INSERT INTO patient_wallets (patient_id, balance, currency, subscription_status)
         VALUES ($1, 0.00, 'INR', 'Free')
         RETURNING *`,
        [req.patient.id]
      );
    }

    const wallet = result.rows[0];

    if (wallet.subscription_plan_id) {
      const planRes = await query('SELECT * FROM subscription_plans WHERE id = $1', [wallet.subscription_plan_id]);
      wallet.plan = planRes.rows[0] || null;
    }

    res.status(200).json({
      success: true,
      wallet
    });
  } catch (err) {
    console.error('Fetch Wallet Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving wallet details' });
  }
});

// @route   GET /api/wallet/transactions
// @desc    Get patient wallet transaction history
router.get('/transactions', authenticatePatientToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM wallet_transactions WHERE patient_id = $1 ORDER BY created_at DESC`,
      [req.patient.id]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      transactions: result.rows
    });
  } catch (err) {
    console.error('Fetch Transactions Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving transactions' });
  }
});

// @route   POST /api/wallet/topup
// @desc    Add funds to patient wallet balance
router.post('/topup', authenticatePatientToken, async (req, res) => {
  const { amount } = req.body;
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid top-up amount greater than 0'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Update wallet balance
    const walletRes = await client.query(
      `UPDATE patient_wallets
       SET balance = balance + $1, updated_at = NOW()
       WHERE patient_id = $2
       RETURNING *`,
      [numAmount, req.patient.id]
    );

    let wallet = walletRes.rows[0];

    if (!wallet) {
      const initWallet = await client.query(
        `INSERT INTO patient_wallets (patient_id, balance, currency, subscription_status)
         VALUES ($1, $2, 'INR', 'Free')
         RETURNING *`,
        [req.patient.id, numAmount]
      );
      wallet = initWallet.rows[0];
    }

    // Insert transaction log
    const refId = `TOP-${Date.now()}`;
    await client.query(
      `INSERT INTO wallet_transactions (patient_id, amount, type, transaction_type, description, reference_id)
       VALUES ($1, $2, 'Top-up', 'Credit', 'Wallet balance top-up', $3)`,
      [req.patient.id, numAmount, refId]
    );

    await client.query('COMMIT');
    client.release();

    res.status(200).json({
      success: true,
      message: `Successfully added ₹${numAmount} to wallet`,
      wallet
    });
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error('Top-up Error:', err);
    res.status(500).json({ success: false, message: 'Server error executing top-up' });
  }
});

// @route   GET /api/wallet/plans
// @desc    Get subscription plans
router.get('/plans', async (req, res) => {
  try {
    const result = await query('SELECT * FROM subscription_plans ORDER BY price ASC');
    res.status(200).json({
      success: true,
      count: result.rows.length,
      plans: result.rows
    });
  } catch (err) {
    console.error('Fetch Plans Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving subscription plans' });
  }
});

// @route   POST /api/wallet/subscribe
// @desc    Subscribe to a health plan using wallet balance
router.post('/subscribe', authenticatePatientToken, async (req, res) => {
  const { planId } = req.body;

  if (!planId) {
    return res.status(400).json({
      success: false,
      message: 'Plan ID is required'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get plan details
    const planRes = await client.query('SELECT * FROM subscription_plans WHERE id = $1', [planId]);
    if (planRes.rows.length === 0) {
      throw new Error('Subscription plan not found');
    }

    const plan = planRes.rows[0];
    const planPrice = parseFloat(plan.price);

    // Get wallet
    const walletRes = await client.query('SELECT * FROM patient_wallets WHERE patient_id = $1 FOR UPDATE', [req.patient.id]);
    let wallet = walletRes.rows[0];

    if (!wallet || parseFloat(wallet.balance) < planPrice) {
      throw new Error(`Insufficient wallet balance. Plan costs ₹${planPrice}, current balance is ₹${wallet ? wallet.balance : 0}`);
    }

    // Deduct balance and update subscription
    const updatedWalletRes = await client.query(
      `UPDATE patient_wallets
       SET balance = balance - $1,
           subscription_plan_id = $2,
           subscription_status = 'Active',
           updated_at = NOW()
       WHERE patient_id = $3
       RETURNING *`,
      [planPrice, plan.id, req.patient.id]
    );

    wallet = updatedWalletRes.rows[0];
    wallet.plan = plan;

    // Log transaction
    const refId = `SUB-${Date.now()}`;
    await client.query(
      `INSERT INTO wallet_transactions (patient_id, amount, type, transaction_type, description, reference_id)
       VALUES ($1, $2, 'Subscription', 'Debit', $3, $4)`,
      [req.patient.id, planPrice, `Subscription to ${plan.name}`, refId]
    );

    await client.query('COMMIT');
    client.release();

    res.status(200).json({
      success: true,
      message: `Subscribed successfully to ${plan.name}`,
      wallet
    });
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error('Subscription Error:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to process subscription'
    });
  }
});

export default router;
