-- Combined database migrations for InstaParty
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new)

-- Add theme column to parties table
alter table parties add column if not exists theme text default 'classic' not null;

-- Add potluck flag to parties table
alter table parties add column if not exists has_potluck boolean default false;

-- Potluck items table
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

-- Index for performance
create index if not exists potluck_items_party_id_idx on potluck_items(party_id);

-- RLS Policies for potluck_items
alter table potluck_items enable row level security;

create policy "Potluck items for public parties are viewable by everyone"
  on potluck_items for select
  using (
    exists (
      select 1 from parties
      where parties.id = potluck_items.party_id
      and parties.is_public = true
    )
  );

create policy "Party owners can view potluck items for their parties"
  on potluck_items for select
  using (
    exists (
      select 1 from parties
      where parties.id = potluck_items.party_id
      and parties.user_id = auth.uid()
    )
  );

create policy "Anyone can create potluck items"
  on potluck_items for insert
  with check (true);

create policy "Anyone can update potluck items"
  on potluck_items for update
  using (true);

create policy "Party owners can delete potluck items from their parties"
  on potluck_items for delete
  using (
    exists (
      select 1 from parties
      where parties.id = potluck_items.party_id
      and parties.user_id = auth.uid()
    )
  );
