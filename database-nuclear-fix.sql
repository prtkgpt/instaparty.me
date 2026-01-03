-- NUCLEAR OPTION - Complete RLS Reset for Parties Table
-- This will fix the infinite recursion permanently

-- Step 1: Disable RLS temporarily
ALTER TABLE parties DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies (brute force)
DROP POLICY IF EXISTS "view_public_parties" ON parties;
DROP POLICY IF EXISTS "view_own_parties" ON parties;
DROP POLICY IF EXISTS "cohosts_view_parties" ON parties;
DROP POLICY IF EXISTS "authenticated_create_parties" ON parties;
DROP POLICY IF EXISTS "update_own_parties" ON parties;
DROP POLICY IF EXISTS "cohosts_update_parties" ON parties;
DROP POLICY IF EXISTS "delete_own_parties" ON parties;
DROP POLICY IF EXISTS "Public parties are viewable by everyone" ON parties;
DROP POLICY IF EXISTS "Users can view their own parties" ON parties;
DROP POLICY IF EXISTS "Cohosts can view their assigned parties" ON parties;
DROP POLICY IF EXISTS "Users can insert their own parties" ON parties;
DROP POLICY IF EXISTS "Users can create parties" ON parties;
DROP POLICY IF EXISTS "Authenticated users can create parties" ON parties;
DROP POLICY IF EXISTS "Users can update their own parties" ON parties;
DROP POLICY IF EXISTS "Cohosts can update their assigned parties" ON parties;
DROP POLICY IF EXISTS "Users can delete their own parties" ON parties;

-- Step 3: Re-enable RLS
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;

-- Step 4: Create MINIMAL policies (absolutely NO recursion possible)

-- SELECT: Public parties
CREATE POLICY "parties_select_public"
ON parties FOR SELECT
USING (is_public = true);

-- SELECT: Own parties
CREATE POLICY "parties_select_own"
ON parties FOR SELECT
USING (auth.uid() = user_id);

-- SELECT: Cohost parties (using IN subquery, NOT EXISTS)
CREATE POLICY "parties_select_cohost"
ON parties FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM party_cohosts WHERE party_cohosts.party_id = parties.id
  )
);

-- INSERT: Only check user_id matches
CREATE POLICY "parties_insert"
ON parties FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Own parties
CREATE POLICY "parties_update_own"
ON parties FOR UPDATE
USING (auth.uid() = user_id);

-- UPDATE: Cohost parties
CREATE POLICY "parties_update_cohost"
ON parties FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM party_cohosts WHERE party_cohosts.party_id = parties.id
  )
);

-- DELETE: Only owners
CREATE POLICY "parties_delete"
ON parties FOR DELETE
USING (auth.uid() = user_id);

-- Verify
SELECT tablename, policyname
FROM pg_policies
WHERE tablename = 'parties';
