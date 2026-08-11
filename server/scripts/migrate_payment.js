import { query } from '../src/config/db.js';

async function runMigration() {
  try {
    console.log('Starting payment database migration...');

    await query(`
      CREATE TABLE IF NOT EXISTS patient_wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID UNIQUE NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        balance NUMERIC(12, 2) DEFAULT 0.00,
        currency VARCHAR(10) DEFAULT 'INR',
        subscription_status VARCHAR(50) DEFAULT 'Free',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('Credit', 'Debit', 'Refund')),
        amount NUMERIC(10, 2) NOT NULL,
        description TEXT,
        razorpay_payment_id VARCHAR(100),
        razorpay_order_id VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      ALTER TABLE doctors 
      ADD COLUMN IF NOT EXISTS razorpay_account_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS bank_ifsc_code VARCHAR(20),
      ADD COLUMN IF NOT EXISTS bank_account_holder VARCHAR(100),
      ADD COLUMN IF NOT EXISTS pan_number VARCHAR(20);

      CREATE TABLE IF NOT EXISTS doctor_payouts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
        amount NUMERIC(10, 2) NOT NULL,
        payout_status VARCHAR(50) DEFAULT 'Pending',
        razorpay_transfer_id VARCHAR(100),
        failure_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('Payment tables and doctor bank columns created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

runMigration();
