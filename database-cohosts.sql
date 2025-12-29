-- Add co-host management feature
-- Run this in your Supabase SQL Editor

-- Function to get user ID by email (security definer to allow auth.users access)
create or replace function get_user_id_by_email(email_address text)
returns uuid
language plpgsql
security definer
as $$
declare
  user_uuid uuid;
begin
  select id into user_uuid
  from auth.users
  where email = email_address
  limit 1;

  return user_uuid;
end;
$$;

-- Party co-hosts table
create table if not exists party_cohosts (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  party_id uuid references parties(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  invited_by uuid references auth.users(id) on delete cascade not null,
  unique(party_id, user_id)
);

-- Index for performance
create index if not exists party_cohosts_party_id_idx on party_cohosts(party_id);
create index if not exists party_cohosts_user_id_idx on party_cohosts(user_id);

-- RLS Policies for party_cohosts
alter table party_cohosts enable row level security;

drop policy if exists "Party owners can view cohosts for their parties" on party_cohosts;
create policy "Party owners can view cohosts for their parties"
  on party_cohosts for select
  using (
    exists (
      select 1 from parties
      where parties.id = party_cohosts.party_id
      and parties.user_id = auth.uid()
    )
  );

drop policy if exists "Cohosts can view their cohost relationships" on party_cohosts;
create policy "Cohosts can view their cohost relationships"
  on party_cohosts for select
  using (auth.uid() = user_id);

drop policy if exists "Party owners can add cohosts" on party_cohosts;
create policy "Party owners can add cohosts"
  on party_cohosts for insert
  with check (
    exists (
      select 1 from parties
      where parties.id = party_cohosts.party_id
      and parties.user_id = auth.uid()
    )
  );

drop policy if exists "Party owners can remove cohosts" on party_cohosts;
create policy "Party owners can remove cohosts"
  on party_cohosts for delete
  using (
    exists (
      select 1 from parties
      where parties.id = party_cohosts.party_id
      and parties.user_id = auth.uid()
    )
  );

-- Update existing policies to include cohosts

-- Parties: Cohosts can view parties they're assigned to
drop policy if exists "Cohosts can view their assigned parties" on parties;
create policy "Cohosts can view their assigned parties"
  on parties for select
  using (
    exists (
      select 1 from party_cohosts
      where party_cohosts.party_id = parties.id
      and party_cohosts.user_id = auth.uid()
    )
  );

-- Parties: Cohosts can update parties they're assigned to
drop policy if exists "Cohosts can update their assigned parties" on parties;
create policy "Cohosts can update their assigned parties"
  on parties for update
  using (
    exists (
      select 1 from party_cohosts
      where party_cohosts.party_id = parties.id
      and party_cohosts.user_id = auth.uid()
    )
  );

-- Invites: Cohosts can view invites for their assigned parties
drop policy if exists "Cohosts can view invites for their assigned parties" on invites;
create policy "Cohosts can view invites for their assigned parties"
  on invites for select
  using (
    exists (
      select 1 from party_cohosts
      join parties on parties.id = party_cohosts.party_id
      where parties.id = invites.party_id
      and party_cohosts.user_id = auth.uid()
    )
  );

-- Email invitations: Cohosts can send email invitations
drop policy if exists "Cohosts can view email invitations for their assigned parties" on email_invitations;
create policy "Cohosts can view email invitations for their assigned parties"
  on email_invitations for select
  using (
    exists (
      select 1 from party_cohosts
      join parties on parties.id = party_cohosts.party_id
      where parties.id = email_invitations.party_id
      and party_cohosts.user_id = auth.uid()
    )
  );

drop policy if exists "Cohosts can create email invitations for their assigned parties" on email_invitations;
create policy "Cohosts can create email invitations for their assigned parties"
  on email_invitations for insert
  with check (
    exists (
      select 1 from party_cohosts
      join parties on parties.id = party_cohosts.party_id
      where parties.id = email_invitations.party_id
      and party_cohosts.user_id = auth.uid()
    )
  );

-- Potluck items: Cohosts can manage potluck items
drop policy if exists "Cohosts can view potluck items for their assigned parties" on potluck_items;
create policy "Cohosts can view potluck items for their assigned parties"
  on potluck_items for select
  using (
    exists (
      select 1 from party_cohosts
      join parties on parties.id = party_cohosts.party_id
      where parties.id = potluck_items.party_id
      and party_cohosts.user_id = auth.uid()
    )
  );

drop policy if exists "Cohosts can delete potluck items from their assigned parties" on potluck_items;
create policy "Cohosts can delete potluck items from their assigned parties"
  on potluck_items for delete
  using (
    exists (
      select 1 from party_cohosts
      join parties on parties.id = party_cohosts.party_id
      where parties.id = potluck_items.party_id
      and party_cohosts.user_id = auth.uid()
    )
  );

-- Party comments: Cohosts can delete comments
drop policy if exists "Cohosts can delete comments from their assigned parties" on party_comments;
create policy "Cohosts can delete comments from their assigned parties"
  on party_comments for delete
  using (
    exists (
      select 1 from party_cohosts
      join parties on parties.id = party_cohosts.party_id
      where parties.id = party_comments.party_id
      and party_cohosts.user_id = auth.uid()
    )
  );
