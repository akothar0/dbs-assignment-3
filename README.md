# PokéArena — Collect & Battle

A full-stack Pokemon collection and battle app with a Nintendo DS-era aesthetic. Browse all 493 Gen I-IV Pokemon, catch them, build teams of 6, and battle wild trainers or challenge other players.

Built for MPCS 51238 (Design, Build, Ship) — Assignment 3.

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **Auth**: Clerk v7
- **Database**: Supabase (PostgreSQL + RLS)
- **External API**: PokeAPI
- **Deployment**: Vercel

## Features

- **Pokedex** — Browse, search, and filter all 493 Pokemon with animated Gen V sprites
- **Collection** — Catch Pokemon, nickname them, mark favorites, release
- **Teams** — Build teams of 6 from your collection with type coverage analysis
- **Battle** — Turn-based battles with type advantages, STAB, crits, and animated sprites
- **Leaderboard** — Public rankings by wins, catches, or win rate
- **Community Battles** — Challenge other trainers' teams from the leaderboard
- **Profile** — Stats, win/loss record, battle history

## Getting Started

### Prerequisites

- Node.js 20+
- A [Clerk](https://clerk.com) app (for auth)
- A [Supabase](https://supabase.com) project (for database)

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/akothar0/dbs-assignment-3.git
   cd dbs-assignment-3
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` with your keys:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   ```

4. Set up the database by running the schema in `supabase/schema.sql` via the Supabase SQL editor.

5. Connect Clerk and Supabase via their respective dashboards (Clerk → "Connect with Supabase", Supabase → Auth → Third-Party Auth → Add Clerk).

6. Run the dev server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).
