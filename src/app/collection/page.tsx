"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { formatPokemonName, getSprite } from "@/lib/pokeapi/helpers";
import { TypeBadge } from "@/components/ui/type-badge";

interface CollectedPokemon {
  id: string;
  user_id: string;
  pokemon_id: number;
  nickname: string | null;
  caught_at: string;
  is_favorite: boolean;
}

interface PokemonWithDetails extends CollectedPokemon {
  name: string;
  types: string[];
  sprite: string;
}

type SortBy = "caught_at" | "pokemon_id" | "name";

export default function CollectionPage() {
  const { isSignedIn } = useAuth();
  const [pokemon, setPokemon] = useState<PokemonWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>("caught_at");
  const [editingNickname, setEditingNickname] = useState<number | null>(null);
  const [nicknameValue, setNicknameValue] = useState("");

  const fetchCollection = useCallback(async () => {
    try {
      const res = await fetch("/api/collection");
      if (!res.ok) return;
      const collected: CollectedPokemon[] = await res.json();

      // Fetch details for each collected Pokemon (parallel)
      const withDetails = await Promise.all(
        collected.map(async (c) => {
          const detailRes = await fetch(`/api/pokemon/${c.pokemon_id}`);
          const detail = await detailRes.json();
          return {
            ...c,
            name: detail.name,
            types: detail.types,
            sprite: getSprite(c.pokemon_id),
          };
        })
      );

      setPokemon(withDetails);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      fetchCollection();
    }
  }, [isSignedIn, fetchCollection]);

  const sorted = [...pokemon].sort((a, b) => {
    if (sortBy === "caught_at") {
      return new Date(b.caught_at).getTime() - new Date(a.caught_at).getTime();
    }
    if (sortBy === "pokemon_id") return a.pokemon_id - b.pokemon_id;
    return a.name.localeCompare(b.name);
  });

  async function handleRelease(pokemonId: number) {
    const res = await fetch(`/api/collection?pokemon_id=${pokemonId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setPokemon((prev) => prev.filter((p) => p.pokemon_id !== pokemonId));
    }
  }

  async function handleToggleFavorite(pokemonId: number, current: boolean) {
    const res = await fetch("/api/collection", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pokemon_id: pokemonId, is_favorite: !current }),
    });
    if (res.ok) {
      setPokemon((prev) =>
        prev.map((p) =>
          p.pokemon_id === pokemonId ? { ...p, is_favorite: !current } : p
        )
      );
    }
  }

  async function handleSaveNickname(pokemonId: number) {
    const res = await fetch("/api/collection", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pokemon_id: pokemonId, nickname: nicknameValue }),
    });
    if (res.ok) {
      setPokemon((prev) =>
        prev.map((p) =>
          p.pokemon_id === pokemonId
            ? { ...p, nickname: nicknameValue || null }
            : p
        )
      );
      setEditingNickname(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="font-pixel text-lg text-accent mb-6">My Collection</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="pixel-border animate-pulse rounded-lg bg-surface h-44"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-pixel text-lg text-accent">My Collection</h1>
          <p className="text-sm text-foreground/60 mt-1">
            {pokemon.length} / 493 Pokémon caught
          </p>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          <option value="caught_at">Recently Caught</option>
          <option value="pokemon_id">Pokédex #</option>
          <option value="name">Name</option>
        </select>
      </div>

      {pokemon.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-pixel text-xs text-foreground/50 mb-4">
            No Pokémon caught yet!
          </p>
          <Link
            href="/pokedex"
            className="rounded bg-accent px-6 py-3 text-sm font-semibold text-background hover:bg-accent-dim transition-colors"
          >
            Browse Pokédex
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {sorted.map((p) => (
            <div
              key={p.pokemon_id}
              className="pixel-border rounded-lg bg-surface p-3 relative group"
            >
              {/* Favorite toggle */}
              <button
                onClick={() => handleToggleFavorite(p.pokemon_id, p.is_favorite)}
                className="absolute top-2 left-2 text-base z-10"
                title={p.is_favorite ? "Unfavorite" : "Favorite"}
              >
                {p.is_favorite ? "★" : "☆"}
              </button>

              {/* Release button */}
              <button
                onClick={() => handleRelease(p.pokemon_id)}
                className="absolute top-2 right-2 text-xs text-danger/50 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Release"
              >
                ✕
              </button>

              <Link href={`/pokedex/${p.pokemon_id}`} className="flex flex-col items-center">
                <span className="text-[10px] text-foreground/30 font-pixel">
                  #{String(p.pokemon_id).padStart(3, "0")}
                </span>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.sprite}
                  alt={p.name}
                  width={72}
                  height={72}
                  className="h-18 w-18 image-rendering-pixelated"
                  loading="lazy"
                />

                {/* Nickname or name */}
                {editingNickname === p.pokemon_id ? (
                  <div className="mt-1 flex gap-1" onClick={(e) => e.preventDefault()}>
                    <input
                      type="text"
                      value={nicknameValue}
                      onChange={(e) => setNicknameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveNickname(p.pokemon_id);
                        if (e.key === "Escape") setEditingNickname(null);
                      }}
                      className="w-20 rounded bg-background px-1 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      autoFocus
                      placeholder={formatPokemonName(p.name)}
                    />
                  </div>
                ) : (
                  <p
                    className="mt-1 text-xs font-semibold text-foreground cursor-pointer hover:text-accent transition-colors text-center"
                    onClick={(e) => {
                      e.preventDefault();
                      setEditingNickname(p.pokemon_id);
                      setNicknameValue(p.nickname ?? "");
                    }}
                    title="Click to nickname"
                  >
                    {p.nickname || formatPokemonName(p.name)}
                  </p>
                )}
              </Link>

              <div className="mt-1 flex justify-center gap-1">
                {p.types.map((type) => (
                  <TypeBadge key={type} type={type} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
