-- Database migration script to update merchants table
-- Run this script manually in your PostgreSQL database

-- Step 1: Add firstName column as nullable first
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS firstName varchar;

-- Step 2: Update existing records with a default firstName
-- You can customize this based on your needs
UPDATE merchants 
SET firstName = 'User' 
WHERE firstName IS NULL;

-- Step 3: Make firstName NOT NULL after updating existing records
ALTER TABLE merchants ALTER COLUMN firstName SET NOT NULL;

-- Step 5: Drop passwordHash column if it exists  
ALTER TABLE merchants DROP COLUMN IF EXISTS passwordHash;

-- Step 6: Add senderAddress and type columns to transactions table
-- These enable proper debit/credit labeling for all transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "senderAddress" varchar;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "type" varchar DEFAULT 'debit';

-- Backfill existing send transactions: mark them as debit, and received as credit
UPDATE transactions SET "type" = 'debit' WHERE "recipientAddress" IS NOT NULL AND "type" IS NULL;
UPDATE transactions SET "type" = 'credit' WHERE "recipientAddress" IS NULL AND "senderAddress" IS NULL AND "type" IS NULL;

-- Verify the final table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'merchants' 
ORDER BY ordinal_position;