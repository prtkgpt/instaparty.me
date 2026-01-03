-- Add charity donation feature
-- Run this in your Supabase SQL Editor

-- Add charity fields to parties table
alter table parties add column if not exists charity_name text;
alter table parties add column if not exists charity_url text;
alter table parties add column if not exists charity_message text;
