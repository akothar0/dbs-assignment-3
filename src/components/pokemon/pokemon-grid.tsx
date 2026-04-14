import Link from "next/link";
import { PokemonCard } from "./pokemon-card";
import { getPokemonList, searchPokemon, getPokemonDetail } from "@/lib/pokeapi/client";
import { getSprite } from "@/lib/pokeapi/helpers";

const PAGE_SIZE = 24;

interface PokemonGridProps {
  query?: string;
  typeFilter?: string;
  page: number;
}

export async function PokemonGrid({ query, typeFilter, page }: PokemonGridProps) {
  const currentPage = Math.max(1, page);
  const offset = (currentPage - 1) * PAGE_SIZE;

  let pokemonEntries: { id: number; name: string }[];
  let total: number;

  if (query) {
    const results = await searchPokemon(query);
    total = results.length;
    pokemonEntries = results.slice(offset, offset + PAGE_SIZE);
  } else {
    const data = await getPokemonList(PAGE_SIZE, offset);
    pokemonEntries = data.pokemon;
    total = data.total;
  }

  // Fetch details for type info (parallel)
  const details = await Promise.all(
    pokemonEntries.map((p) => getPokemonDetail(p.id))
  );

  // Apply type filter if present
  let filtered = details;
  if (typeFilter) {
    filtered = details.filter((d) =>
      d.types.some((t) => t.type.name === typeFilter)
    );
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (filtered.length === 0) {
    return (
      <div className="py-12 text-center text-foreground/50">
        <p className="font-pixel text-xs">No Pokémon found</p>
        <p className="mt-2 text-sm">Try a different search or filter</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {filtered.map((pokemon) => (
          <PokemonCard
            key={pokemon.id}
            id={pokemon.id}
            name={pokemon.name}
            types={pokemon.types.map((t) => t.type.name)}
            sprite={getSprite(pokemon.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {!query && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          {currentPage > 1 && (
            <Link
              href={`/pokedex?page=${currentPage - 1}${typeFilter ? `&type=${typeFilter}` : ""}`}
              className="rounded bg-surface px-4 py-2 text-sm text-foreground hover:bg-surface-light transition-colors"
            >
              Previous
            </Link>
          )}

          <span className="font-pixel text-xs text-foreground/50">
            {currentPage} / {totalPages}
          </span>

          {currentPage < totalPages && (
            <Link
              href={`/pokedex?page=${currentPage + 1}${typeFilter ? `&type=${typeFilter}` : ""}`}
              className="rounded bg-surface px-4 py-2 text-sm text-foreground hover:bg-surface-light transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </>
  );
}
