# Pokemon Collector & Battle Arena

A full-stack Pokemon collection and battle app with a Nintendo DS-era (Diamond/Pearl/Black/White) aesthetic.

## Concept

Users browse Gen 1-4 Pokemon (493 total) via the PokeAPI, catch them to build a personal collection, assemble teams of 6, and battle wild Pokemon in a turn-based 1v1 system with type advantages and animated sprites.

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **Auth**: Clerk v7 (sign up, log in, sign out) — uses `<Show>` component, `proxy.ts`
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
- `proxy.ts` instead of `middleware.ts` (Next.js 16 convention)
- Clerk v7: use `<Show when="signed-in">` / `<Show when="signed-out">` (not deprecated `<SignedIn>` / `<SignedOut>`)
- `<ClerkProvider>` placed inside `<body>`, not wrapping `<html>`

## Battle Engine

Simplified Gen V damage formula at level 50:
- `damage = ((22 * power * A/D) / 50 + 2) * STAB * typeEffectiveness * random * crit`
- STAB: 1.5x if move type matches attacker type
- Type effectiveness: full 18x18 chart (Gen VI+ rules) in `lib/battle/type-chart.ts`
- Critical hits: 6.25% chance, 1.5x multiplier
- Random factor: 0.85–1.0

Deliberately excluded to keep scope manageable:
- Status effects (paralysis, burn, poison, etc.)
- Abilities and held items
- Stat stages / buffs / debuffs
- Accuracy/evasion checks (all moves hit)
- PP tracking (unlimited uses)
- Mid-battle switching (auto-switch on faint)

## File Structure

```
src/
├── proxy.ts                          — Clerk middleware (route protection)
├── app/
│   ├── layout.tsx                    — ClerkProvider, fonts, navbar
│   ├── page.tsx                      — Landing page
│   ├── sign-in/[[...sign-in]]/page.tsx
│   ├── sign-up/[[...sign-up]]/page.tsx
│   ├── pokedex/
│   │   ├── page.tsx                  — Browse/search grid with pagination
│   │   └── [id]/page.tsx             — Pokemon detail (stats, moves, catch)
│   ├── collection/page.tsx           — User's caught Pokemon (sort, nickname, release)
│   ├── teams/
│   │   ├── page.tsx                  — List user's teams
│   │   └── [id]/page.tsx             — Team editor (6-slot picker from collection)
│   ├── battle/page.tsx               — Team select → battle → result
│   ├── profile/page.tsx              — Stats, win/loss, battle history
│   └── api/
│       ├── pokemon/
│       │   ├── route.ts              — GET list with pagination/search
│       │   ├── [id]/route.ts         — GET single Pokemon detail
│       │   └── move/[name]/route.ts  — GET move detail (power, type, class)
│       ├── collection/route.ts       — GET/POST/PATCH/DELETE user collection
│       ├── teams/route.ts            — GET/POST/PUT/DELETE user teams
│       ├── battle/
│       │   ├── route.ts              — POST generate opponent / save result
│       │   └── history/route.ts      — GET user's battle history
│       └── profile/route.ts          — GET/POST profile with auto-create
├── components/
│   ├── ui/
│   │   ├── type-badge.tsx            — Pokemon type colored pill
│   │   └── hp-bar.tsx                — Animated HP bar (green/yellow/red)
│   ├── layout/
│   │   └── navbar.tsx                — Responsive nav with mobile hamburger
│   ├── pokemon/
│   │   ├── pokemon-card.tsx          — Grid card with sprite and types
│   │   ├── pokemon-grid.tsx          — Server component: paginated grid
│   │   └── pokemon-search.tsx        — Search bar + type filter dropdown
│   ├── collection/
│   │   └── catch-button.tsx          — Catch/release with pokeball animation
│   ├── team/
│   │   └── team-slot.tsx             — Single team slot (filled or empty)
│   └── battle/
│       ├── battle-scene.tsx          — Two sprites, HP bars, type badges
│       ├── move-selector.tsx         — 4-button type-colored move grid
│       └── battle-log.tsx            — Scrolling pixel-font narration
└── lib/
    ├── pokeapi/
    │   ├── client.ts                 — Cached fetch wrapper (24hr revalidate)
    │   ├── types.ts                  — PokeAPI response types
    │   └── helpers.ts                — Sprite URLs, name formatting, type colors
    ├── supabase/
    │   ├── client.ts                 — Browser client with Clerk token
    │   └── server.ts                 — Server client with Clerk token
    └── battle/
        ├── engine.ts                 — Battle state machine + turn resolution
        ├── type-chart.ts             — 18x18 type effectiveness map
        └── damage.ts                 — Damage formula
```

## Style Preferences

- **Theme**: Dark background (#0f0f23), card surfaces (#1a1a2e), light text (#e2e2e2)
- **Accent**: Gold (#ffd700) for highlights, Pokemon-type colors for badges
- **Font**: `Press Start 2P` for headings and battle text, `Inter` for body (both via `next/font`)
- **Sprites**: Gen V animated GIFs from PokeAPI sprites repo, static fallback
- **UI**: Pixel-art CSS borders (box-shadow insets), DS-style menu layouts
- **Animations**: CSS transitions for HP bars, keyframes for sprite shake/flash
- **Responsive**: Mobile hamburger menu, stacking grids on small screens

## Environment Variables (.env.local)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```
