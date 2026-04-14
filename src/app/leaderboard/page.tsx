"use client";

import { useEffect, useState } from "react";
import { useAuth, Show } from "@clerk/nextjs";
import Link from "next/link";
import { getAnimatedSprite, getStaticSprite } from "@/lib/pokeapi/helpers";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  wins: number;
  losses: number;
  winRate: number;
  totalCaught: number;
  team: { id: string; slots: number[] } | null;
}

type SortBy = "wins" | "caught" | "winrate";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "wins", label: "Wins" },
  { value: "caught", label: "Caught" },
  { value: "winrate", label: "Win Rate" },
];

export default function LeaderboardPage() {
  const { userId } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("wins");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?sort=${sortBy}`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sortBy]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-pixel text-lg text-accent mb-1">Leaderboard</h1>
      <p className="text-sm text-foreground/60 mb-6">
        Top trainers in PokéArena
      </p>

      {/* Sort tabs */}
      <div className="flex gap-2 mb-6">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSortBy(opt.value)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              sortBy === opt.value
                ? "bg-accent text-background"
                : "bg-surface text-foreground/60 hover:bg-surface-light"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="pixel-border animate-pulse rounded-lg bg-surface h-20"
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl mb-4">🏆</p>
          <p className="font-pixel text-xs text-foreground/50 mb-2">
            No trainers yet!
          </p>
          <p className="text-sm text-foreground/40">
            Be the first to catch Pokémon and battle.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const isMe = entry.userId === userId;
            const totalBattles = entry.wins + entry.losses;

            return (
              <div
                key={entry.userId}
                className={`pixel-border rounded-lg bg-surface px-4 py-3 flex items-center gap-4 ${
                  isMe ? "ring-1 ring-accent/40" : ""
                }`}
              >
                {/* Rank */}
                <span className="font-pixel text-sm text-foreground/30 w-8 text-center shrink-0">
                  {entry.rank <= 3
                    ? ["🥇", "🥈", "🥉"][entry.rank - 1]
                    : `#${entry.rank}`}
                </span>

                {/* Avatar */}
                {entry.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.avatarUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-surface-light flex items-center justify-center shrink-0">
                    <span className="text-sm">👤</span>
                  </div>
                )}

                {/* Name + stats */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {entry.displayName}
                    {isMe && (
                      <span className="text-xs text-accent/60 ml-2">you</span>
                    )}
                  </p>
                  <div className="flex gap-3 text-xs text-foreground/50 mt-0.5">
                    <span>
                      <span className="text-success">{entry.wins}W</span>
                      {" / "}
                      <span className="text-danger">{entry.losses}L</span>
                    </span>
                    {totalBattles > 0 && (
                      <span>{entry.winRate}% rate</span>
                    )}
                    <span>{entry.totalCaught} caught</span>
                  </div>
                </div>

                {/* Team preview */}
                {entry.team && (
                  <div className="hidden sm:flex gap-0.5 shrink-0">
                    {entry.team.slots.map((id) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={id}
                        src={getAnimatedSprite(id) ?? getStaticSprite(id)}
                        alt=""
                        width={28}
                        height={28}
                        className="h-7 w-7 image-rendering-pixelated"
                      />
                    ))}
                  </div>
                )}

                {/* Challenge button */}
                {entry.team && !isMe && (
                  <Show when="signed-in">
                    <Link
                      href={`/battle?challenge=${entry.team.id}&trainer=${encodeURIComponent(entry.displayName)}`}
                      className="rounded bg-accent px-3 py-1.5 text-xs font-semibold text-background hover:bg-accent-dim transition-colors shrink-0"
                    >
                      Challenge
                    </Link>
                  </Show>
                )}

                {isMe && entry.team && (
                  <span className="text-xs text-foreground/30 shrink-0">
                    —
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
