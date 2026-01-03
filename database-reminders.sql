-- Add reminder system
-- Run this in your Supabase SQL Editor

-- Party reminders configuration
create table if not exists party_reminder_settings (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  party_id uuid references parties(id) on delete cascade not null unique,
  send_24h_before boolean default true,
  send_2h_before boolean default true,
  send_day_after boolean default false,
  custom_message text,
  reminder_enabled boolean default true
);

-- Track sent reminders to avoid duplicates
create table if not exists sent_reminders (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  party_id uuid references parties(id) on delete cascade not null,
  reminder_type text not null check (reminder_type in ('24h_before', '2h_before', 'day_after')),
  sent_to_count integer default 0,
  unique(party_id, reminder_type)
);

-- Indexes for performance
create index if not exists party_reminder_settings_party_id_idx on party_reminder_settings(party_id);
create index if not exists sent_reminders_party_id_idx on sent_reminders(party_id);

-- RLS Policies
alter table party_reminder_settings enable row level security;
alter table sent_reminders enable row level security;

drop policy if exists "Party owners can manage reminder settings" on party_reminder_settings;
create policy "Party owners can manage reminder settings"
  on party_reminder_settings for all
  using (
    exists (
      select 1 from parties
      where parties.id = party_reminder_settings.party_id
      and parties.user_id = auth.uid()
    )
  );

drop policy if exists "Cohosts can manage reminder settings" on party_reminder_settings;
create policy "Cohosts can manage reminder settings"
  on party_reminder_settings for all
  using (
    exists (
      select 1 from party_cohosts
      join parties on parties.id = party_cohosts.party_id
      where parties.id = party_reminder_settings.party_id
      and party_cohosts.user_id = auth.uid()
    )
  );

drop policy if exists "Party owners can view sent reminders" on sent_reminders;
create policy "Party owners can view sent reminders"
  on sent_reminders for select
  using (
    exists (
      select 1 from parties
      where parties.id = sent_reminders.party_id
      and parties.user_id = auth.uid()
    )
  );

drop policy if exists "Cohosts can view sent reminders" on sent_reminders;
create policy "Cohosts can view sent reminders"
  on sent_reminders for select
  using (
    exists (
      select 1 from party_cohosts
      join parties on parties.id = party_cohosts.party_id
      where parties.id = sent_reminders.party_id
      and party_cohosts.user_id = auth.uid()
    )
  );
