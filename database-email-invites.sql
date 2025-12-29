-- Add this to your existing database
-- Run this in your Supabase SQL Editor

-- Email invitations tracking table
create table if not exists email_invitations (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  party_id uuid references parties(id) on delete cascade not null,
  email text not null,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text not null default 'sent' check (status in ('sent', 'bounced', 'opened'))
);

-- Index for performance
create index if not exists email_invitations_party_id_idx on email_invitations(party_id);

-- RLS Policies for email_invitations
alter table email_invitations enable row level security;

create policy "Party owners can view their email invitations"
  on email_invitations for select
  using (
    exists (
      select 1 from parties
      where parties.id = email_invitations.party_id
      and parties.user_id = auth.uid()
    )
  );

create policy "Party owners can create email invitations"
  on email_invitations for insert
  with check (
    exists (
      select 1 from parties
      where parties.id = email_invitations.party_id
      and parties.user_id = auth.uid()
    )
  );
