-- Add photo gallery feature
-- Run this in your Supabase SQL Editor

-- Party photos table
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

-- Index for performance
create index if not exists party_photos_party_id_idx on party_photos(party_id);
create index if not exists party_photos_created_at_idx on party_photos(created_at desc);

-- RLS Policies for party_photos
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

-- Note: You also need to create a storage bucket called 'party-photos' in Supabase Storage
-- Go to Storage > Create a new bucket > Name it 'party-photos' > Make it public
-- Then set up storage policies:
/*
Storage policies (set in Supabase Dashboard > Storage > party-photos > Policies):

1. SELECT policy - "Public party photos are viewable":
   - Operation: SELECT
   - Policy: true (allow all reads since bucket is public)

2. INSERT policy - "Anyone can upload photos":
   - Operation: INSERT
   - Policy: true (allow all uploads)

3. DELETE policy - "Owners and cohosts can delete":
   - Operation: DELETE
   - Policy: Check if user is owner or cohost of the party
*/
