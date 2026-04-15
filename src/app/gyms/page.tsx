"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { GYM_LEADERS, type GymLeader } from "@/lib/gyms/gym-data";
import { TypeBadge } from "@/components/ui/type-badge";
import { TYPE_COLORS } from "@/lib/pokeapi/helpers";
import { getAnimatedSprite, getStaticSprite } from "@/lib/pokeapi/helpers";

interface Badge {
  gym_id: string;
  earned_at: string;
}

export default function GymsPage() {
  const { isSignedIn } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    fetch("/api/badges")
      .then((res) => res.json())
      .then((data) => {
        setBadges(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isSignedIn]);

  const earnedIds = new Set(badges.map((b) => b.gym_id));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-pixel text-lg text-accent mb-2">Gym Challenge</h1>
      <p className="text-sm text-foreground/60 mb-6">
        Defeat all 8 Gym Leaders and earn their badges
      </p>

      {/* Badge showcase */}
      <div className="pixel-border rounded-lg bg-surface p-4 mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="font-pixel text-[10px] text-foreground/50">
            Your Badges
          </p>
          <p className="font-pixel text-[10px] text-accent">
            {earnedIds.size}/8
          </p>
        </div>
        <div className="flex justify-center gap-3 sm:gap-4">
          {GYM_LEADERS.map((gym) => {
            const earned = earnedIds.has(gym.id);
            const color = TYPE_COLORS[gym.type] ?? "#888";
            return (
              <div key={gym.id} className="flex flex-col items-center gap-1">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl transition-all ${
                    earned
                      ? "animate-badge-glow"
                      : "bg-foreground/10 opacity-40"
                  }`}
                  style={
                    earned
                      ? { backgroundColor: `${color}30`, color }
                      : undefined
                  }
                  title={earned ? gym.badgeName : `???`}
                >
                  {earned ? gym.badgeEmoji : "?"}
                </div>
                <span className="text-[8px] text-foreground/40 font-pixel hidden sm:block">
                  {earned ? gym.badgeName.split(" ")[0] : "???"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gym cards */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-pokeball text-4xl">●</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GYM_LEADERS.map((gym) => (
            <GymCard
              key={gym.id}
              gym={gym}
              earned={earnedIds.has(gym.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GymCard({ gym, earned }: { gym: GymLeader; earned: boolean }) {
  const color = TYPE_COLORS[gym.type] ?? "#888";

  return (
    <div className="pixel-border rounded-lg bg-surface p-4 relative overflow-hidden">
      {/* Earned indicator */}
      {earned && (
        <div
          className="absolute top-0 right-0 px-2 py-1 rounded-bl text-[9px] font-pixel font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {gym.badgeEmoji} Earned
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {gym.badgeEmoji}
        </div>
        <div className="min-w-0">
          <h3 className="font-pixel text-xs text-accent">{gym.name}</h3>
          <p className="text-[10px] text-foreground/40">{gym.title}</p>
        </div>
      </div>

      {/* Type + difficulty */}
      <div className="flex items-center gap-3 mb-3">
        <TypeBadge type={gym.type} />
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={`text-xs ${
                i < gym.difficulty ? "text-accent" : "text-foreground/15"
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="text-[10px] text-foreground/40 ml-auto">
          {gym.team.length} Pokémon
        </span>
      </div>

      {/* Team preview */}
      <div className="flex gap-1 mb-3">
        {gym.team.map((id) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={id}
            src={getAnimatedSprite(id) ?? getStaticSprite(id)}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 image-rendering-pixelated"
          />
        ))}
      </div>

      {/* Quote */}
      <p className="text-[11px] text-foreground/40 italic mb-3">
        &ldquo;{gym.quote}&rdquo;
      </p>

      {/* Challenge button */}
      <Link
        href={`/battle?gym=${gym.id}`}
        className={`block text-center rounded px-4 py-2 text-sm font-semibold transition-colors ${
          earned
            ? "bg-surface-light text-foreground/70 hover:bg-foreground/10"
            : "bg-accent text-background hover:bg-accent-dim"
        }`}
      >
        {earned ? "Rematch" : "Challenge"}
      </Link>
    </div>
  );
}
