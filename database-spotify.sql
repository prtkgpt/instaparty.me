-- Add Spotify playlist integration
-- Run this in your Supabase SQL Editor

-- Add Spotify playlist fields to parties table
alter table parties add column if not exists spotify_playlist_id text;
alter table parties add column if not exists spotify_playlist_url text;
alter table parties add column if not exists spotify_playlist_name text;
