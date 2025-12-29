-- Add theme support to parties table
-- Run this in your Supabase SQL Editor

alter table parties add column if not exists theme text default 'classic' not null;
