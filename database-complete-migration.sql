-- ============================================
-- COMPLETE INSTAPARTY DATABASE MIGRATION
-- Run this ONCE in your Supabase SQL Editor
-- ============================================

-- Step 1: Email invitations table
create table if not exists email_invitations (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  party_id uuid references parties(id) on delete cascade not null,
  email text not null,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text not null default 'sent' check (status in ('sent', 'bounced', 'opened'))
);

create index if not exists email_invitations_party_id_idx on email_invitations(party_id);

alter table email_invitations enable row level security;

drop policy if exists "Party owners can view their email invitations" on email_invitations;
create policy "Party owners can view their email invitations"
  on email_invitations for select
  using (
    exists (
      select 1 from parties
      where parties.id = email_invitations.party_id
      and parties.user_id = auth.uid()
    )
  );

drop policy if exists "Party owners can create email invitations" on email_invitations;
create policy "Party owners can create email invitations"
  on email_invitations for insert
  with check (
    exists (
      select 1 from parties
      where parties.id = email_invitations.party_id
      and parties.user_id = auth.uid()
    )
  );

-- Step 2: Potluck feature
alter table parties add column if not exists has_potluck boolean default false;

create table if not exists potluck_items (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  party_id uuid references parties(id) on delete cascade not null,
  item_name text not null,
  category text,
  claimed_by_name text,
  claimed_by_email text,
  quantity integer default 1,
  notes text
);

create index if not exists potluck_items_party_id_idx on potluck_items(party_id);

alter table potluck_items enable row level security;

drop policy if exists "Potluck items for public parties are viewable by everyone" on potluck_items;
create policy "Potluck items for public parties are viewable by everyone"
  on potluck_items for select
  using (
    exists (
      select 1 from parties
      where parties.id = potluck_items.party_id
      and parties.is_public = true
    )
  );

drop policy if exists "Party owners can view potluck items for their parties" on potluck_items;
create policy "Party owners can view potluck items for their parties"
  on potluck_items for select
  using (
    exists (
      select 1 from parties
      where parties.id = potluck_items.party_id
      and parties.user_id = auth.uid()
    )
  );

drop policy if exists "Anyone can create potluck items" on potluck_items;
create policy "Anyone can create potluck items"
  on potluck_items for insert
  with check (true);

drop policy if exists "Anyone can update potluck items" on potluck_items;
create policy "Anyone can update potluck items"
  on potluck_items for update
  using (true);

drop policy if exists "Party owners can delete potluck items from their parties" on potluck_items;
create policy "Party owners can delete potluck items from their parties"
  on potluck_items for delete
  using (
    exists (
      select 1 from parties
      where parties.id = potluck_items.party_id
      and parties.user_id = auth.uid()
    )
  );

-- Step 3: Party comments
create table if not exists party_comments (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  party_id uuid references parties(id) on delete cascade not null,
  name text not null,
  message text not null,
  is_approved boolean default true
);

create index if not exists party_comments_party_id_idx on party_comments(party_id);
create index if not exists party_comments_created_at_idx on party_comments(created_at desc);

alter table party_comments enable row level security;

drop policy if exists "Public party comments are viewable by everyone" on party_comments;
create policy "Public party comments are viewable by everyone"
  on party_comments for select
  using (
    exists (
      select 1 from parties
      where parties.id = party_comments.party_id
      and parties.is_public = true
      and party_comments.is_approved = true
    )
  );

drop policy if exists "Party owners can view all comments on their parties" on party_comments;
create policy "Party owners can view all comments on their parties"
  on party_comments for select
  using (
    exists (
      select 1 from parties
      where parties.id = party_comments.party_id
      and parties.user_id = auth.uid()
    )
  );

drop policy if exists "Anyone can create comments" on party_comments;
create policy "Anyone can create comments"
  on party_comments for insert
  with check (true);

drop policy if exists "Party owners can delete comments on their parties" on party_comments;
create policy "Party owners can delete comments on their parties"
  on party_comments for delete
  using (
    exists (
      select 1 from parties
      where parties.id = party_comments.party_id
      and parties.user_id = auth.uid()
    )
  );

-- Step 4: Co-hosts
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

create table if not exists party_cohosts (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  party_id uuid references parties(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  invited_by uuid references auth.users(id) on delete cascade not null,
  unique(party_id, user_id)
);

create index if not exists party_cohosts_party_id_idx on party_cohosts(party_id);
create index if not exists party_cohosts_user_id_idx on party_cohosts(user_id);

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

-- Cohost policies for parties
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

-- Cohost policies for invites
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

-- Cohost policies for email invitations
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

-- Cohost policies for potluck items
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

-- Cohost policies for party comments
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

-- Step 5: Party photos
create table if not exists party_photos (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  party_id uuid references parties(id) on delete cascade not null,
  uploaded_by_name text not null,
  uploaded_by_email text,
  file_path text not null,
  file_name text not null,
  caption text,
  likes integer default 0
);

create index if not exists party_photos_party_id_idx on party_photos(party_id);
create index if not exists party_photos_created_at_idx on party_photos(created_at desc);

alter table party_photos enable row level security;

drop policy if exists "Public party photos are viewable by everyone" on party_photos;
create policy "Public party photos are viewable by everyone"
  on party_photos for select
  using (
    exists (
      select 1 from parties
      where parties.id = party_photos.party_id
      and parties.is_public = true
    )
  );

drop policy if exists "Party owners can view photos for their parties" on party_photos;
create policy "Party owners can view photos for their parties"
  on party_photos for select
  using (
    exists (
      select 1 from parties
      where parties.id = party_photos.party_id
      and parties.user_id = auth.uid()
    )
  );

drop policy if exists "Cohosts can view photos for their assigned parties" on party_photos;
create policy "Cohosts can view photos for their assigned parties"
  on party_photos for select
  using (
    exists (
      select 1 from party_cohosts
      join parties on parties.id = party_cohosts.party_id
      where parties.id = party_photos.party_id
      and party_cohosts.user_id = auth.uid()
    )
  );

drop policy if exists "Anyone can upload photos to public parties" on party_photos;
create policy "Anyone can upload photos to public parties"
  on party_photos for insert
  with check (
    exists (
      select 1 from parties
      where parties.id = party_photos.party_id
      and parties.is_public = true
    )
  );

drop policy if exists "Party owners can delete photos from their parties" on party_photos;
create policy "Party owners can delete photos from their parties"
  on party_photos for delete
  using (
    exists (
      select 1 from parties
      where parties.id = party_photos.party_id
      and parties.user_id = auth.uid()
    )
  );

drop policy if exists "Cohosts can delete photos from their assigned parties" on party_photos;
create policy "Cohosts can delete photos from their assigned parties"
  on party_photos for delete
  using (
    exists (
      select 1 from party_cohosts
      join parties on parties.id = party_cohosts.party_id
      where parties.id = party_photos.party_id
      and party_cohosts.user_id = auth.uid()
    )
  );

-- Step 6: Charity donation fields
alter table parties add column if not exists charity_name text;
alter table parties add column if not exists charity_url text;
alter table parties add column if not exists charity_message text;

-- Step 7: Spotify playlist fields
alter table parties add column if not exists spotify_playlist_id text;
alter table parties add column if not exists spotify_playlist_url text;
alter table parties add column if not exists spotify_playlist_name text;

-- Step 8: Automated reminders
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

create table if not exists sent_reminders (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  party_id uuid references parties(id) on delete cascade not null,
  reminder_type text not null check (reminder_type in ('24h_before', '2h_before', 'day_after')),
  sent_to_count integer default 0,
  unique(party_id, reminder_type)
);

create index if not exists party_reminder_settings_party_id_idx on party_reminder_settings(party_id);
create index if not exists sent_reminders_party_id_idx on sent_reminders(party_id);

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

-- Step 9: Guest messaging
create table if not exists party_messages (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  party_id uuid references parties(id) on delete cascade not null,
  sent_by uuid references auth.users(id) on delete cascade not null,
  subject text not null,
  message text not null,
  sent_to_count integer default 0
);

create index if not exists party_messages_party_id_idx on party_messages(party_id);
create index if not exists party_messages_created_at_idx on party_messages(created_at desc);

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

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================
-- Next step: Create storage bucket for photos
-- Go to: Storage > Create bucket > Name: "party-photos" > Make it public
-- ============================================
