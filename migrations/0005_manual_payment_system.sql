-- Migration: Manual Payment Verification System
-- This migration updates the payments table to support manual bank transfer verification
-- and adds payment accounts table for admin-managed bank details

-- Drop and recreate payments table with new schema
DROP TABLE IF EXISTS payments;

CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  payment_type TEXT NOT NULL, -- 'deposit' | 'completion' (50% each)
  payment_method TEXT NOT NULL, -- 'gcash' | 'seabank' | 'paymaya' | 'bank_transfer'
  
  -- Payment proof details
  proof_image_url TEXT, -- R2 URL or base64 data URL
  reference_number TEXT, -- Transaction reference from bank
  sender_name TEXT, -- Name of person who sent payment
  sender_account_number TEXT, -- Last 4 digits or partial account
  
  -- Admin verification
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'verified' | 'rejected'
  verified_by TEXT, -- Admin user ID who verified
  verified_at INTEGER, -- Timestamp
  rejection_reason TEXT,
  admin_notes TEXT,
  
  metadata TEXT, -- JSON string for additional data
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create payment_accounts table for admin-managed bank accounts
CREATE TABLE payment_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_type TEXT NOT NULL, -- 'gcash' | 'seabank' | 'paymaya' | 'bank_transfer'
  account_name TEXT NOT NULL, -- Account holder name
  account_number TEXT NOT NULL, -- Phone number for e-wallets, account number for banks
  bank_name TEXT, -- Only for bank_transfer type
  instructions TEXT, -- Special instructions for this payment method
  qr_code_url TEXT, -- Optional QR code image for GCash/PayMaya
  is_active INTEGER DEFAULT 1, -- Boolean
  `order` INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Insert default payment accounts (admin can update these)
INSERT INTO payment_accounts (account_type, account_name, account_number, bank_name, instructions, is_active, `order`, created_at, updated_at) VALUES
('gcash', 'Lunaxcode', '09XX XXX XXXX', NULL, 'Send payment to this GCash number and upload the receipt.', 1, 1, unixepoch(), unixepoch()),
('seabank', 'Lunaxcode', 'XXXX XXXX XXXX', 'SeaBank Philippines', 'Transfer to this SeaBank account and upload the proof of payment.', 1, 2, unixepoch(), unixepoch()),
('paymaya', 'Lunaxcode', '09XX XXX XXXX', NULL, 'Send payment via PayMaya and upload the transaction receipt.', 1, 3, unixepoch(), unixepoch()),
('bank_transfer', 'Lunaxcode', 'XXXX XXXX XXXX', 'BDO / BPI / Metrobank', 'Bank transfer to any of our bank accounts. Upload the deposit slip or online transfer receipt.', 1, 4, unixepoch(), unixepoch());

-- Create indexes for better query performance
CREATE INDEX idx_payments_project_id ON payments(project_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_type ON payments(payment_type);
CREATE INDEX idx_payment_accounts_active ON payment_accounts(is_active);

