-- COMPLETE FIX FOR INFINITE RECURSION
-- This will completely reset all parties table policies
-- Run this in Supabase SQL Editor NOW

-- Step 1: Drop ALL policies on parties table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'parties') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON parties';
    END LOOP;
END $$;

-- Step 2: Create NEW simple policies without recursion

-- Anyone can view public parties (no recursion)
CREATE POLICY "view_public_parties"
  ON parties FOR SELECT
  TO public
  USING (is_public = true);

-- Users can view their own parties (no recursion)
CREATE POLICY "view_own_parties"
  ON parties FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Cohosts can view parties (no recursion - direct join)
CREATE POLICY "cohosts_view_parties"
  ON parties FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT party_id
      FROM party_cohosts
      WHERE user_id = auth.uid()
    )
  );

-- Authenticated users can create parties (SIMPLE - no checks on parties table)
CREATE POLICY "authenticated_create_parties"
  ON parties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own parties (simple check)
CREATE POLICY "update_own_parties"
  ON parties FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Cohosts can update parties (direct join, no recursion)
CREATE POLICY "cohosts_update_parties"
  ON parties FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT party_id
      FROM party_cohosts
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    id IN (
      SELECT party_id
      FROM party_cohosts
      WHERE user_id = auth.uid()
    )
  );

-- Users can delete their own parties
CREATE POLICY "delete_own_parties"
  ON parties FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Verify policies were created
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'parties'
ORDER BY policyname;
