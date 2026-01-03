-- Fix infinite recursion in parties table policies
-- Run this in your Supabase SQL Editor

-- Drop ALL existing policies on parties table
drop policy if exists "Public parties are viewable by everyone" on parties;
drop policy if exists "Users can view their own parties" on parties;
drop policy if exists "Cohosts can view their assigned parties" on parties;
drop policy if exists "Users can insert their own parties" on parties;
drop policy if exists "Users can create parties" on parties;
drop policy if exists "Users can update their own parties" on parties;
drop policy if exists "Cohosts can update their assigned parties" on parties;
drop policy if exists "Users can delete their own parties" on parties;

-- Recreate policies WITHOUT recursion

-- SELECT policies
create policy "Public parties are viewable by everyone"
  on parties for select
  using (is_public = true);

create policy "Users can view their own parties"
  on parties for select
  using (auth.uid() = user_id);

create policy "Cohosts can view their assigned parties"
  on parties for select
  using (
    exists (
      select 1 from party_cohosts
      where party_cohosts.party_id = parties.id
      and party_cohosts.user_id = auth.uid()
    )
  );

-- INSERT policy (no recursion - just check if user is authenticated)
create policy "Authenticated users can create parties"
  on parties for insert
  with check (auth.uid() = user_id);

-- UPDATE policies
create policy "Users can update their own parties"
  on parties for update
  using (auth.uid() = user_id);

create policy "Cohosts can update their assigned parties"
  on parties for update
  using (
    exists (
      select 1 from party_cohosts
      where party_cohosts.party_id = parties.id
      and party_cohosts.user_id = auth.uid()
    )
  );

-- DELETE policy
create policy "Users can delete their own parties"
  on parties for delete
  using (auth.uid() = user_id);
