# Pokemon Collector & Battle Arena

A full-stack Pokemon collection and battle app with a Nintendo DS-era (Diamond/Pearl/Black/White) aesthetic.

## Concept

Users browse Gen 1-4 Pokemon (493 total) via the PokeAPI, catch them to build a personal collection, assemble teams of 6, and battle wild Pokemon in a turn-based 1v1 system with type advantages and animated sprites.

## Stack

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Auth**: Clerk (sign up, log in, sign out)
- **Database**: Supabase (PostgreSQL + RLS)
- **External API**: PokeAPI (https://pokeapi.co/) — no key needed
- **Deployment**: Vercel

## Data Model (Supabase)

### profiles
- `id` UUID PK
- `user_id` TEXT NOT NULL UNIQUE — Clerk user ID
- `display_name` TEXT
- `avatar_url` TEXT
- `wins` INTEGER DEFAULT 0
- `losses` INTEGER DEFAULT 0
- `total_caught` INTEGER DEFAULT 0
- `created_at` TIMESTAMPTZ

### collected_pokemon
- `id` UUID PK
- `user_id` TEXT NOT NULL — Clerk user ID
- `pokemon_id` INTEGER NOT NULL — PokeAPI national dex (1-493)
- `nickname` TEXT
- `caught_at` TIMESTAMPTZ
- `is_favorite` BOOLEAN DEFAULT false
- UNIQUE(user_id, pokemon_id)

### teams
- `id` UUID PK
- `user_id` TEXT NOT NULL
- `name` TEXT NOT NULL DEFAULT 'My Team'
- `slot_1` through `slot_6` INTEGER (nullable) — PokeAPI pokemon_id
- `created_at`, `updated_at` TIMESTAMPTZ

### battle_records
- `id` UUID PK
- `user_id` TEXT NOT NULL
- `user_team_id` UUID FK → teams
- `opponent_pokemon_ids` INTEGER[]
- `result` TEXT CHECK ('win', 'loss')
- `user_remaining` INTEGER
- `opponent_remaining` INTEGER
- `battle_log` JSONB
- `battled_at` TIMESTAMPTZ

All tables use RLS with `auth.jwt()->>'sub'` matching `user_id`.

## Architecture Decisions

- Only store `pokemon_id` in Supabase — fetch all Pokemon data from PokeAPI with caching
- Server-side PokeAPI calls via Next.js route handlers (never from client directly)
- Battle engine runs client-side (no server round-trips per turn)
- Hardcoded 18x18 type chart (static data, avoids API calls at battle time)
- Gen V Black/White animated sprites as primary (covers all Gen 1-4 Pokemon)
- Clerk + Supabase native integration (2025 pattern, not JWT templates)

## File Structure

```
src/
├── app/
│   ├── layout.tsx, page.tsx
│   ├── sign-in/[[...sign-in]]/page.tsx
│   ├── sign-up/[[...sign-up]]/page.tsx
│   ├── pokedex/ (browse + [id] detail)
│   ├── collection/ (user's caught Pokemon)
│   ├── teams/ (list + [id] builder)
│   ├── battle/ (arena + [id] result)
│   ├── profile/
│   └── api/ (pokemon, collection, teams, battle, profile routes)
├── components/
│   ├── ui/ (retro-button, type-badge, hp-bar, pixel-border)
│   ├── layout/ (navbar)
│   ├── pokemon/ (card, detail, sprite, search)
│   ├── collection/ (grid, catch-button)
│   ├── team/ (builder, slot)
│   └── battle/ (arena, scene, move-selector, log, result)
├── lib/
│   ├── pokeapi/ (client, types, helpers)
│   ├── supabase/ (client, server, types)
│   └── battle/ (engine, type-chart, damage)
└── hooks/ (use-pokemon, use-collection, use-battle)
```

## Style Preferences

- **Theme**: Dark background (#0f0f23), card surfaces (#1a1a2e), light text (#e2e2e2)
- **Accent**: Gold (#ffd700) for highlights, Pokemon-type colors for badges
- **Font**: `Press Start 2P` for headings and battle text, `Inter` for body
- **Sprites**: Gen V animated GIFs from PokeAPI sprites repo, static fallback
- **UI**: Pixel-art CSS borders (box-shadow insets), DS-style menu layouts
- **Animations**: CSS transitions for HP bars, keyframes for sprite shake/flash

## Environment Variables (.env.local)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
