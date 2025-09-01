-- Temporary fix: Disable RLS on users and schools tables for development
-- This allows basic user creation and school creation to work
-- WARNING: This is for development only, not for production

-- Disable RLS on users table temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Disable RLS on schools table temporarily
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;

-- You can re-enable them later with:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
