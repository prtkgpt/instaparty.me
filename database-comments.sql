-- Add party comments/messages feature
-- Run this in your Supabase SQL Editor

-- Party comments table
create table if not exists party_comments (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  party_id uuid references parties(id) on delete cascade not null,
  name text not null,
  message text not null,
  is_approved boolean default true
);

-- Index for performance
create index if not exists party_comments_party_id_idx on party_comments(party_id);
create index if not exists party_comments_created_at_idx on party_comments(created_at desc);

-- RLS Policies for party_comments
alter table party_comments enable row level security;

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

create policy "Party owners can view all comments on their parties"
  on party_comments for select
  using (
    exists (
      select 1 from parties
      where parties.id = party_comments.party_id
      and parties.user_id = auth.uid()
    )
  );

create policy "Anyone can create comments"
  on party_comments for insert
  with check (true);

create policy "Party owners can delete comments on their parties"
  on party_comments for delete
  using (
    exists (
      select 1 from parties
      where parties.id = party_comments.party_id
      and parties.user_id = auth.uid()
    )
  );
