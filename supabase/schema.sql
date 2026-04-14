-- PokéArena Schema
-- Run this in Supabase SQL Editor to create all tables

-- ============================================================
-- Table: profiles
-- Stores Clerk user info + denormalized stats
-- ============================================================
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  total_caught INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (user_id = (auth.jwt()->>'sub'));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (user_id = (auth.jwt()->>'sub'));

-- ============================================================
-- Table: collected_pokemon
-- One catch per species per user
-- ============================================================
CREATE TABLE collected_pokemon (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  pokemon_id INTEGER NOT NULL,
  nickname TEXT,
  caught_at TIMESTAMPTZ DEFAULT now(),
  is_favorite BOOLEAN DEFAULT false,
  UNIQUE(user_id, pokemon_id)
);

ALTER TABLE collected_pokemon ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read collections"
  ON collected_pokemon FOR SELECT
  USING (true);

CREATE POLICY "Users can catch pokemon"
  ON collected_pokemon FOR INSERT
  WITH CHECK (user_id = (auth.jwt()->>'sub'));

CREATE POLICY "Users can update own pokemon"
  ON collected_pokemon FOR UPDATE
  USING (user_id = (auth.jwt()->>'sub'));

CREATE POLICY "Users can release own pokemon"
  ON collected_pokemon FOR DELETE
  USING (user_id = (auth.jwt()->>'sub'));

-- ============================================================
-- Table: teams
-- Each team has up to 6 pokemon slots
-- ============================================================
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Team',
  slot_1 INTEGER,
  slot_2 INTEGER,
  slot_3 INTEGER,
  slot_4 INTEGER,
  slot_5 INTEGER,
  slot_6 INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read teams"
  ON teams FOR SELECT
  USING (true);

CREATE POLICY "Users can create own teams"
  ON teams FOR INSERT
  WITH CHECK (user_id = (auth.jwt()->>'sub'));

CREATE POLICY "Users can update own teams"
  ON teams FOR UPDATE
  USING (user_id = (auth.jwt()->>'sub'));

CREATE POLICY "Users can delete own teams"
  ON teams FOR DELETE
  USING (user_id = (auth.jwt()->>'sub'));

-- ============================================================
-- Table: battle_records
-- Stores battle results and turn-by-turn log
-- ============================================================
CREATE TABLE battle_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  opponent_pokemon_ids INTEGER[] NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('win', 'loss')),
  user_remaining INTEGER NOT NULL,
  opponent_remaining INTEGER NOT NULL,
  battle_log JSONB,
  battled_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE battle_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read battle records"
  ON battle_records FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own battle records"
  ON battle_records FOR INSERT
  WITH CHECK (user_id = (auth.jwt()->>'sub'));
