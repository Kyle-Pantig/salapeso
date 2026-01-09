-- ============================================
-- Row Level Security (RLS) Policies for SalaPeso
-- Run this in Supabase SQL Editor
-- ============================================

-- Note: Your backend uses Prisma with service_role key which BYPASSES RLS.
-- These policies protect direct database access and add defense-in-depth.

-- ============================================
-- 1. USERS TABLE
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid()::text = id OR auth.role() = 'service_role');

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid()::text = id OR auth.role() = 'service_role');

-- Only backend can insert users (via service role)
CREATE POLICY "Service role can insert users"
ON users FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Only backend can delete users
CREATE POLICY "Service role can delete users"
ON users FOR DELETE
USING (auth.role() = 'service_role');

-- ============================================
-- 2. WALLETS TABLE (Public Read)
-- ============================================
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Anyone can view active wallets
CREATE POLICY "Anyone can view wallets"
ON wallets FOR SELECT
USING (true);

-- Only backend can manage wallets
CREATE POLICY "Service role can manage wallets"
ON wallets FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- 3. SAVINGS_GOALS TABLE
-- ============================================
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- Users can only view their own goals
CREATE POLICY "Users can view own goals"
ON savings_goals FOR SELECT
USING (auth.uid()::text = "userId" OR auth.role() = 'service_role');

-- Users can only insert their own goals
CREATE POLICY "Users can insert own goals"
ON savings_goals FOR INSERT
WITH CHECK (auth.uid()::text = "userId" OR auth.role() = 'service_role');

-- Users can only update their own goals
CREATE POLICY "Users can update own goals"
ON savings_goals FOR UPDATE
USING (auth.uid()::text = "userId" OR auth.role() = 'service_role');

-- Users can only delete their own goals
CREATE POLICY "Users can delete own goals"
ON savings_goals FOR DELETE
USING (auth.uid()::text = "userId" OR auth.role() = 'service_role');

-- ============================================
-- 4. SAVINGS_ENTRIES TABLE
-- ============================================
ALTER TABLE savings_entries ENABLE ROW LEVEL SECURITY;

-- Users can only view entries for their own goals
CREATE POLICY "Users can view own entries"
ON savings_entries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM savings_goals 
    WHERE savings_goals.id = savings_entries."savingsGoalId" 
    AND (savings_goals."userId" = auth.uid()::text OR auth.role() = 'service_role')
  )
);

-- Users can only insert entries for their own goals
CREATE POLICY "Users can insert own entries"
ON savings_entries FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM savings_goals 
    WHERE savings_goals.id = "savingsGoalId" 
    AND (savings_goals."userId" = auth.uid()::text OR auth.role() = 'service_role')
  )
);

-- Users can only update entries for their own goals
CREATE POLICY "Users can update own entries"
ON savings_entries FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM savings_goals 
    WHERE savings_goals.id = savings_entries."savingsGoalId" 
    AND (savings_goals."userId" = auth.uid()::text OR auth.role() = 'service_role')
  )
);

-- Users can only delete entries for their own goals
CREATE POLICY "Users can delete own entries"
ON savings_entries FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM savings_goals 
    WHERE savings_goals.id = savings_entries."savingsGoalId" 
    AND (savings_goals."userId" = auth.uid()::text OR auth.role() = 'service_role')
  )
);

-- ============================================
-- 5. ACCOUNTS TABLE (OAuth accounts)
-- ============================================
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Users can only view their own accounts
CREATE POLICY "Users can view own accounts"
ON accounts FOR SELECT
USING (auth.uid()::text = "userId" OR auth.role() = 'service_role');

-- Only backend can manage accounts
CREATE POLICY "Service role can manage accounts"
ON accounts FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- 6. SESSIONS TABLE
-- ============================================
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own sessions
CREATE POLICY "Users can view own sessions"
ON sessions FOR SELECT
USING (auth.uid()::text = "userId" OR auth.role() = 'service_role');

-- Only backend can manage sessions
CREATE POLICY "Service role can manage sessions"
ON sessions FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- 7. PASSWORD_RESET_TOKENS TABLE (Backend only)
-- ============================================
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Only backend can access password reset tokens
CREATE POLICY "Service role only for password tokens"
ON password_reset_tokens FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- 8. EMAIL_VERIFICATION_TOKENS TABLE (Backend only)
-- ============================================
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Only backend can access email verification tokens
CREATE POLICY "Service role only for email tokens"
ON email_verification_tokens FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- 9. VERIFICATION_TOKENS TABLE (Backend only)
-- ============================================
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;

-- Only backend can access verification tokens
CREATE POLICY "Service role only for verification tokens"
ON verification_tokens FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select on wallets to everyone (public data)
GRANT SELECT ON wallets TO anon, authenticated;

-- Grant full access to authenticated users on their data
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON savings_goals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON savings_entries TO authenticated;
GRANT SELECT ON accounts TO authenticated;
GRANT SELECT ON sessions TO authenticated;

-- ============================================
-- DONE! 🔒
-- ============================================
-- Your database now has Row Level Security enabled.
-- Users can only access their own data.
-- The backend (service_role) can access everything.
