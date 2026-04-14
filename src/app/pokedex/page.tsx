import { Suspense } from "react";
import { PokemonSearch } from "@/components/pokemon/pokemon-search";
import { PokemonGrid } from "@/components/pokemon/pokemon-grid";

export default async function PokedexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-pixel text-lg text-accent mb-6">Pokédex</h1>
      <p className="text-sm text-foreground/60 mb-6">
        Browse all 493 Pokémon from Generations I–IV
      </p>

      <Suspense fallback={null}>
        <PokemonSearch />
      </Suspense>

      <div className="mt-6">
        <Suspense
          fallback={
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="pixel-border animate-pulse rounded-lg bg-surface h-36"
                />
              ))}
            </div>
          }
        >
          <PokemonGrid
            query={params.q}
            typeFilter={params.type}
            page={parseInt(params.page ?? "1", 10)}
          />
        </Suspense>
      </div>
    </div>
  );
}
