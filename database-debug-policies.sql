-- DEBUG SCRIPT - Find what's causing the recursion
-- Run this to see all policies that might be creating circular dependencies

-- 1. Show all policies on parties table
SELECT
  'PARTIES TABLE' as section,
  policyname,
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'parties'
ORDER BY policyname;

-- 2. Show all policies that reference the parties table
SELECT
  'POLICIES REFERENCING PARTIES' as section,
  tablename,
  policyname,
  cmd,
  qual as using_expression
FROM pg_policies
WHERE qual::text LIKE '%parties%'
   OR with_check::text LIKE '%parties%'
ORDER BY tablename, policyname;

-- 3. Check RLS status on all tables
SELECT
  'RLS STATUS' as section,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('parties', 'invites', 'party_cohosts', 'potluck_items',
                    'party_comments', 'party_photos', 'email_invitations',
                    'party_messages', 'party_reminder_settings')
ORDER BY tablename;
