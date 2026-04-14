"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { TeamSlot } from "@/components/team/team-slot";
import { formatPokemonName, getSprite, TYPE_COLORS } from "@/lib/pokeapi/helpers";
import { TypeBadge } from "@/components/ui/type-badge";

interface Team {
  id: string;
  name: string;
  slot_1: number | null;
  slot_2: number | null;
  slot_3: number | null;
  slot_4: number | null;
  slot_5: number | null;
  slot_6: number | null;
}

interface CollectedPokemon {
  pokemon_id: number;
  nickname: string | null;
}

interface PokemonData {
  name: string;
  types: string[];
}

const SLOT_KEYS = ["slot_1", "slot_2", "slot_3", "slot_4", "slot_5", "slot_6"] as const;

export default function TeamEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [team, setTeam] = useState<Team | null>(null);
  const [collection, setCollection] = useState<CollectedPokemon[]>([]);
  const [pokemonCache, setPokemonCache] = useState<Record<number, PokemonData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [selectingSlot, setSelectingSlot] = useState<number | null>(null);

  const fetchPokemonData = useCallback(async (pokemonId: number) => {
    const res = await fetch(`/api/pokemon/${pokemonId}`);
    const data = await res.json();
    return { name: data.name, types: data.types } as PokemonData;
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;

    async function load() {
      const [teamRes, collectionRes] = await Promise.all([
        fetch(`/api/teams`),
        fetch("/api/collection"),
      ]);

      const teams = await teamRes.json();
      const foundTeam = teams.find((t: Team) => t.id === id);
      if (!foundTeam) {
        router.push("/teams");
        return;
      }

      setTeam(foundTeam);
      setTeamName(foundTeam.name);

      const collected = await collectionRes.json();
      setCollection(collected);

      // Fetch data for all pokemon in slots + collection
      const allIds = new Set<number>();
      SLOT_KEYS.forEach((key) => {
        const val = foundTeam[key];
        if (val) allIds.add(val);
      });
      collected.forEach((c: CollectedPokemon) => allIds.add(c.pokemon_id));

      const entries = await Promise.all(
        Array.from(allIds).map(async (pid) => {
          const data = await fetchPokemonData(pid);
          return [pid, data] as const;
        })
      );

      setPokemonCache(Object.fromEntries(entries));
      setLoading(false);
    }

    load();
  }, [isSignedIn, id, router, fetchPokemonData]);

  function getSlotValue(slotIndex: number): number | null {
    if (!team) return null;
    return team[SLOT_KEYS[slotIndex]] as number | null;
  }

  function setSlotValue(slotIndex: number, value: number | null) {
    if (!team) return;
    setTeam({ ...team, [SLOT_KEYS[slotIndex]]: value });
  }

  async function handleSave() {
    if (!team) return;
    setSaving(true);

    const res = await fetch("/api/teams", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: team.id,
        name: teamName,
        slot_1: team.slot_1,
        slot_2: team.slot_2,
        slot_3: team.slot_3,
        slot_4: team.slot_4,
        slot_5: team.slot_5,
        slot_6: team.slot_6,
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      setTeam(updated);
    }
    setSaving(false);
  }

  // Compute type coverage for the team
  function getTypeCoverage(): Record<string, number> {
    const counts: Record<string, number> = {};
    SLOT_KEYS.forEach((key) => {
      const pid = team?.[key];
      if (pid && pokemonCache[pid]) {
        pokemonCache[pid].types.forEach((t) => {
          counts[t] = (counts[t] || 0) + 1;
        });
      }
    });
    return counts;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-surface rounded" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="pixel-border h-24 bg-surface rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const typeCoverage = getTypeCoverage();
  const filledCount = SLOT_KEYS.filter((key) => team?.[key]).length;

  // Pokemon already on this team (for filtering the picker)
  const teamPokemonIds = new Set(
    SLOT_KEYS.map((key) => team?.[key]).filter(Boolean) as number[]
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/teams"
        className="inline-flex items-center text-sm text-foreground/50 hover:text-accent transition-colors mb-6"
      >
        &larr; Back to Teams
      </Link>

      {/* Team name */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="font-pixel text-lg text-accent bg-transparent border-b border-border focus:border-accent focus:outline-none px-1 py-0.5"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-accent px-4 py-1.5 text-sm font-semibold text-background hover:bg-accent-dim transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <span className="text-xs text-foreground/40">{filledCount} / 6</span>
      </div>

      {/* Team slots */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {SLOT_KEYS.map((_, index) => {
          const pokemonId = getSlotValue(index);
          return (
            <TeamSlot
              key={index}
              slotNumber={index + 1}
              pokemonId={pokemonId}
              pokemonData={pokemonId ? pokemonCache[pokemonId] : null}
              onRemove={() => setSlotValue(index, null)}
              onSelect={() => setSelectingSlot(index)}
            />
          );
        })}
      </div>

      {/* Type coverage */}
      {Object.keys(typeCoverage).length > 0 && (
        <div className="mt-6">
          <h3 className="font-pixel text-xs text-foreground/50 mb-2">
            Type Coverage
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(typeCoverage)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <div key={type} className="flex items-center gap-1">
                  <TypeBadge type={type} />
                  <span className="text-xs text-foreground/40">×{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Pokemon picker modal */}
      {selectingSlot !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg max-h-[70vh] overflow-y-auto rounded-xl bg-surface p-6 pixel-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-pixel text-sm text-accent">
                Choose Pokémon for Slot {selectingSlot + 1}
              </h3>
              <button
                onClick={() => setSelectingSlot(null)}
                className="text-foreground/50 hover:text-foreground text-lg"
              >
                ✕
              </button>
            </div>

            {collection.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-foreground/50 mb-3">
                  No Pokémon in your collection yet!
                </p>
                <Link
                  href="/pokedex"
                  className="rounded bg-accent px-4 py-2 text-sm font-semibold text-background"
                >
                  Catch Some Pokémon
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {collection
                  .filter((c) => !teamPokemonIds.has(c.pokemon_id))
                  .map((c) => {
                    const data = pokemonCache[c.pokemon_id];
                    if (!data) return null;
                    return (
                      <button
                        key={c.pokemon_id}
                        onClick={() => {
                          setSlotValue(selectingSlot, c.pokemon_id);
                          setSelectingSlot(null);
                        }}
                        className="flex flex-col items-center rounded-lg bg-background p-2 hover:bg-surface-light transition-colors"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getSprite(c.pokemon_id)}
                          alt={data.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 image-rendering-pixelated"
                        />
                        <span className="text-[10px] text-foreground/70 mt-1 truncate w-full text-center">
                          {c.nickname || formatPokemonName(data.name)}
                        </span>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
