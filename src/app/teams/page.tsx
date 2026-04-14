"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { formatPokemonName, getSprite } from "@/lib/pokeapi/helpers";

interface Team {
  id: string;
  name: string;
  slot_1: number | null;
  slot_2: number | null;
  slot_3: number | null;
  slot_4: number | null;
  slot_5: number | null;
  slot_6: number | null;
  created_at: string;
}

export default function TeamsPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/teams")
      .then((res) => res.json())
      .then(setTeams)
      .finally(() => setLoading(false));
  }, [isSignedIn]);

  async function handleCreate() {
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Team" }),
    });
    if (res.ok) {
      const team = await res.json();
      router.push(`/teams/${team.id}`);
    }
  }

  async function handleDelete(teamId: string) {
    const res = await fetch(`/api/teams?id=${teamId}`, { method: "DELETE" });
    if (res.ok) {
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
    }
  }

  function getSlots(team: Team): (number | null)[] {
    return [team.slot_1, team.slot_2, team.slot_3, team.slot_4, team.slot_5, team.slot_6];
  }

  function filledSlots(team: Team): number {
    return getSlots(team).filter(Boolean).length;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="font-pixel text-lg text-accent mb-6">My Teams</h1>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="pixel-border animate-pulse rounded-lg bg-surface h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-pixel text-lg text-accent">My Teams</h1>
        <button
          onClick={handleCreate}
          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-background hover:bg-accent-dim transition-colors"
        >
          + New Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-pixel text-xs text-foreground/50 mb-4">
            No teams yet!
          </p>
          <button
            onClick={handleCreate}
            className="rounded bg-accent px-6 py-3 text-sm font-semibold text-background hover:bg-accent-dim transition-colors"
          >
            Create Your First Team
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="pixel-border rounded-lg bg-surface p-4 flex items-center justify-between group"
            >
              <div
                className="flex items-center gap-4 flex-1 cursor-pointer"
                onClick={() => router.push(`/teams/${team.id}`)}
              >
                <div>
                  <h2 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                    {team.name}
                  </h2>
                  <p className="text-xs text-foreground/50 mt-0.5">
                    {filledSlots(team)} / 6 Pokémon
                  </p>
                </div>

                <div className="flex gap-1 ml-4">
                  {getSlots(team).map((slot, i) =>
                    slot ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={getSprite(slot)}
                        alt={`Slot ${i + 1}`}
                        width={40}
                        height={40}
                        className="h-10 w-10 image-rendering-pixelated"
                      />
                    ) : (
                      <div
                        key={i}
                        className="h-10 w-10 rounded bg-background/50 flex items-center justify-center"
                      >
                        <span className="text-foreground/20 text-xs">?</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/teams/${team.id}`)}
                  className="rounded bg-surface-light px-3 py-1.5 text-xs text-foreground hover:text-accent transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(team.id)}
                  className="rounded px-3 py-1.5 text-xs text-danger/50 hover:text-danger transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
