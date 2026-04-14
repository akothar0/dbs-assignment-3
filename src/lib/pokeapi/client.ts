import type { PokemonDetail, PokemonListResponse } from "./types";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";
const MAX_POKEMON_ID = 493; // Gen 1-4

async function fetchWithCache<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    next: { revalidate: 86400 }, // Cache for 24 hours
  });
  if (!res.ok) {
    throw new Error(`PokeAPI error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getPokemonList(
  limit = 24,
  offset = 0
): Promise<{ pokemon: { id: number; name: string }[]; total: number }> {
  // Clamp to Gen 1-4 range
  const clampedOffset = Math.min(offset, MAX_POKEMON_ID);
  const clampedLimit = Math.min(limit, MAX_POKEMON_ID - clampedOffset);

  if (clampedLimit <= 0) {
    return { pokemon: [], total: MAX_POKEMON_ID };
  }

  const data = await fetchWithCache<PokemonListResponse>(
    `${POKEAPI_BASE}/pokemon?limit=${clampedLimit}&offset=${clampedOffset}`
  );

  const pokemon = data.results.map((p) => {
    const id = parseInt(p.url.split("/").filter(Boolean).pop()!, 10);
    return { id, name: p.name };
  });

  return { pokemon, total: MAX_POKEMON_ID };
}

export async function getPokemonDetail(
  idOrName: number | string
): Promise<PokemonDetail> {
  return fetchWithCache<PokemonDetail>(
    `${POKEAPI_BASE}/pokemon/${idOrName}`
  );
}

export async function searchPokemon(
  query: string
): Promise<{ id: number; name: string }[]> {
  // PokeAPI doesn't have a search endpoint, so we fetch the full list
  // and filter client-side. This is cached aggressively.
  const data = await fetchWithCache<PokemonListResponse>(
    `${POKEAPI_BASE}/pokemon?limit=${MAX_POKEMON_ID}&offset=0`
  );

  const normalizedQuery = query.toLowerCase().trim();

  return data.results
    .map((p) => {
      const id = parseInt(p.url.split("/").filter(Boolean).pop()!, 10);
      return { id, name: p.name };
    })
    .filter(
      (p) =>
        p.name.includes(normalizedQuery) ||
        p.id.toString() === normalizedQuery
    );
}
