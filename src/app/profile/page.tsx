"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";

interface Profile {
  display_name: string;
  avatar_url: string | null;
  wins: number;
  losses: number;
  total_caught: number;
}

interface BattleRecord {
  id: string;
  result: "win" | "loss";
  user_remaining: number;
  opponent_remaining: number;
  opponent_pokemon_ids: number[];
  battled_at: string;
}

export default function ProfilePage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [battles, setBattles] = useState<BattleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) return;

    async function load() {
      const [profileRes, battleRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/battle/history").catch(() => null),
      ]);

      if (profileRes.ok) {
        setProfile(await profileRes.json());
      }

      if (battleRes?.ok) {
        setBattles(await battleRes.json());
      }

      setLoading(false);
    }

    load();
  }, [isSignedIn]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-surface rounded-lg" />
          <div className="h-32 bg-surface rounded-lg" />
        </div>
      </div>
    );
  }

  const completionPct = profile
    ? ((profile.total_caught / 493) * 100).toFixed(1)
    : "0";
  const totalBattles = (profile?.wins ?? 0) + (profile?.losses ?? 0);
  const winRate =
    totalBattles > 0
      ? (((profile?.wins ?? 0) / totalBattles) * 100).toFixed(0)
      : "—";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Profile header */}
      <div className="pixel-border rounded-xl bg-surface p-6 flex items-center gap-4 mb-6">
        {user?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.imageUrl}
            alt="Avatar"
            width={64}
            height={64}
            className="h-16 w-16 rounded-full"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
        )}
        <div>
          <h1 className="font-pixel text-sm text-accent">
            {profile?.display_name ?? user?.firstName ?? "Trainer"}
          </h1>
          <p className="text-xs text-foreground/50 mt-1">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <div className="pixel-border rounded-lg bg-surface p-4 text-center">
          <p className="font-pixel text-lg text-accent">
            {profile?.total_caught ?? 0}
          </p>
          <p className="text-[10px] text-foreground/50 mt-1">Caught</p>
        </div>
        <div className="pixel-border rounded-lg bg-surface p-4 text-center">
          <p className="font-pixel text-lg text-foreground">
            {completionPct}%
          </p>
          <p className="text-[10px] text-foreground/50 mt-1">Pokédex</p>
        </div>
        <div className="pixel-border rounded-lg bg-surface p-4 text-center">
          <p className="font-pixel text-lg text-success">
            {profile?.wins ?? 0}
          </p>
          <p className="text-[10px] text-foreground/50 mt-1">Wins</p>
        </div>
        <div className="pixel-border rounded-lg bg-surface p-4 text-center">
          <p className="font-pixel text-lg text-danger">
            {profile?.losses ?? 0}
          </p>
          <p className="text-[10px] text-foreground/50 mt-1">Losses</p>
        </div>
      </div>

      {/* Win rate bar */}
      {totalBattles > 0 && (
        <div className="pixel-border rounded-lg bg-surface p-4 mb-6">
          <div className="flex justify-between text-xs text-foreground/60 mb-2">
            <span>Win Rate</span>
            <span>{winRate}% ({totalBattles} {totalBattles === 1 ? "battle" : "battles"})</span>
          </div>
          <div className="h-3 bg-background rounded-full overflow-hidden">
            {Number(winRate) > 0 && (
              <div
                className="h-full bg-accent rounded-full hp-transition"
                style={{ width: `${winRate}%`, minWidth: "8px" }}
              />
            )}
          </div>
        </div>
      )}

      {/* Battle History */}
      {battles.length > 0 && (
        <div className="mb-6">
          <h2 className="font-pixel text-xs text-foreground/50 mb-3">
            Recent Battles
          </h2>
          <div className="space-y-2">
            {battles.slice(0, 10).map((b) => (
              <div
                key={b.id}
                className="pixel-border rounded-lg bg-surface px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-pixel text-[10px] px-2 py-1 rounded ${
                      b.result === "win"
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    {b.result === "win" ? "WIN" : "LOSS"}
                  </span>
                  <span className="text-xs text-foreground/60">
                    vs {b.opponent_pokemon_ids.length} Pokémon
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-foreground/40">
                    {b.user_remaining} survived
                  </span>
                  <p className="text-[10px] text-foreground/30">
                    {new Date(b.battled_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/collection"
          className="pixel-border rounded-lg bg-surface p-3 text-center text-sm text-foreground/70 hover:text-accent transition-colors"
        >
          Collection
        </Link>
        <Link
          href="/teams"
          className="pixel-border rounded-lg bg-surface p-3 text-center text-sm text-foreground/70 hover:text-accent transition-colors"
        >
          Teams
        </Link>
        <Link
          href="/battle"
          className="pixel-border rounded-lg bg-surface p-3 text-center text-sm text-foreground/70 hover:text-accent transition-colors"
        >
          Battle
        </Link>
      </div>
    </div>
  );
}
