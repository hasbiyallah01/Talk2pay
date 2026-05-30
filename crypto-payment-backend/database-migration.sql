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

-- Verify the final table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'merchants' 
ORDER BY ordinal_position;