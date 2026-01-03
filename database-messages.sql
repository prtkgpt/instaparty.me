-- Add guest messaging feature
-- Run this in your Supabase SQL Editor

-- Party messages/broadcasts table
create table if not exists party_messages (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  party_id uuid references parties(id) on delete cascade not null,
  sent_by uuid references auth.users(id) on delete cascade not null,
  subject text not null,
  message text not null,
  sent_to_count integer default 0
);

-- Index for performance
create index if not exists party_messages_party_id_idx on party_messages(party_id);
create index if not exists party_messages_created_at_idx on party_messages(created_at desc);

-- RLS Policies for party_messages
alter table party_messages enable row level security;

drop policy if exists "Party owners can view messages for their parties" on party_messages;
create policy "Party owners can view messages for their parties"
  on party_messages for select
  using (
    exists (
      select 1 from parties
      where parties.id = party_messages.party_id
      and parties.user_id = auth.uid()
    )
  );

drop policy if exists "Cohosts can view messages for their assigned parties" on party_messages;
create policy "Cohosts can view messages for their assigned parties"
  on party_messages for select
  using (
    exists (
      select 1 from party_cohosts
      join parties on parties.id = party_cohosts.party_id
      where parties.id = party_messages.party_id
      and party_cohosts.user_id = auth.uid()
    )
  );

drop policy if exists "Party owners can send messages" on party_messages;
create policy "Party owners can send messages"
  on party_messages for insert
  with check (
    exists (
      select 1 from parties
      where parties.id = party_messages.party_id
      and parties.user_id = auth.uid()
    )
  );

drop policy if exists "Cohosts can send messages" on party_messages;
create policy "Cohosts can send messages"
  on party_messages for insert
  with check (
    exists (
      select 1 from party_cohosts
      join parties on parties.id = party_cohosts.party_id
      where parties.id = party_messages.party_id
      and party_cohosts.user_id = auth.uid()
    )
  );
