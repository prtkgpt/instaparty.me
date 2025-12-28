-- Database Schema for InstaParty
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Parties table
create table if not exists parties (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  date timestamp with time zone not null,
  location text,
  image_url text,
  slug text unique not null,
  max_guests integer,
  is_public boolean default true
);

-- Invites/RSVPs table
create table if not exists invites (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  party_id uuid references parties(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  status text not null default 'pending' check (status in ('pending', 'yes', 'no', 'maybe')),
  message text,
  plus_ones integer default 0
);

-- Profiles table (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text,
  avatar_url text
);

-- Indexes for better performance
create index if not exists parties_user_id_idx on parties(user_id);
create index if not exists parties_slug_idx on parties(slug);
create index if not exists invites_party_id_idx on invites(party_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
alter table parties enable row level security;
alter table invites enable row level security;
alter table profiles enable row level security;

-- Parties policies
create policy "Public parties are viewable by everyone"
  on parties for select
  using (is_public = true);

create policy "Users can view their own parties"
  on parties for select
  using (auth.uid() = user_id);

create policy "Users can create their own parties"
  on parties for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own parties"
  on parties for update
  using (auth.uid() = user_id);

create policy "Users can delete their own parties"
  on parties for delete
  using (auth.uid() = user_id);

-- Invites policies
create policy "Party invites are viewable by party owner"
  on invites for select
  using (
    exists (
      select 1 from parties
      where parties.id = invites.party_id
      and parties.user_id = auth.uid()
    )
  );

create policy "Public party invites are viewable by everyone"
  on invites for select
  using (
    exists (
      select 1 from parties
      where parties.id = invites.party_id
      and parties.is_public = true
    )
  );

create policy "Anyone can create invites/RSVPs"
  on invites for insert
  with check (true);

create policy "Guests can update their own RSVPs"
  on invites for update
  using (true);

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_parties_updated_at before update on parties
  for each row execute procedure handle_updated_at();

create trigger handle_invites_updated_at before update on invites
  for each row execute procedure handle_updated_at();

create trigger handle_profiles_updated_at before update on profiles
  for each row execute procedure handle_updated_at();
