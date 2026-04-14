import Link from "next/link";
import { notFound } from "next/navigation";
import { getPokemonDetail } from "@/lib/pokeapi/client";
import { toPokemonFull, formatPokemonName, formatStatName } from "@/lib/pokeapi/helpers";
import { TypeBadge } from "@/components/ui/type-badge";

export default async function PokemonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idNum = parseInt(id, 10);

  if (isNaN(idNum) || idNum < 1 || idNum > 493) {
    notFound();
  }

  const raw = await getPokemonDetail(idNum);
  const pokemon = toPokemonFull(raw);

  const maxStat = 255; // Theoretical max base stat

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/pokedex"
        className="inline-flex items-center text-sm text-foreground/50 hover:text-accent transition-colors mb-6"
      >
        &larr; Back to Pokédex
      </Link>

      <div className="pixel-border rounded-xl bg-surface p-6 md:p-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left: Sprite + basic info */}
          <div className="flex flex-col items-center">
            <span className="font-pixel text-xs text-foreground/30 mb-2">
              #{String(pokemon.id).padStart(3, "0")}
            </span>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pokemon.animatedSprite ?? pokemon.sprite}
              alt={pokemon.name}
              width={160}
              height={160}
              className="h-40 w-40 image-rendering-pixelated"
            />

            <h1 className="mt-4 font-pixel text-lg text-accent">
              {formatPokemonName(pokemon.name)}
            </h1>

            <div className="mt-2 flex gap-2">
              {pokemon.types.map((type) => (
                <TypeBadge key={type} type={type} />
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-foreground/70">
              <span>Height</span>
              <span className="text-right">{(pokemon.height / 10).toFixed(1)}m</span>
              <span>Weight</span>
              <span className="text-right">{(pokemon.weight / 10).toFixed(1)}kg</span>
              <span>Base XP</span>
              <span className="text-right">{pokemon.baseExperience}</span>
            </div>

            <div className="mt-4 w-full">
              <h3 className="font-pixel text-[10px] text-foreground/50 mb-2">
                Abilities
              </h3>
              <div className="flex flex-wrap gap-2">
                {pokemon.abilities.map((a) => (
                  <span
                    key={a.name}
                    className={`rounded bg-surface-light px-2 py-1 text-xs ${
                      a.isHidden ? "text-accent/70 italic" : "text-foreground/80"
                    }`}
                  >
                    {formatPokemonName(a.name)}
                    {a.isHidden && " (Hidden)"}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Stats + moves */}
          <div>
            <h3 className="font-pixel text-xs text-foreground/50 mb-3">
              Base Stats
            </h3>
            <div className="space-y-2">
              {pokemon.stats.map((stat) => (
                <div key={stat.name} className="flex items-center gap-3">
                  <span className="w-16 text-xs font-bold text-foreground/60">
                    {formatStatName(stat.name)}
                  </span>
                  <span className="w-8 text-right text-sm font-semibold text-foreground">
                    {stat.value}
                  </span>
                  <div className="flex-1 rounded-full bg-background h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(stat.value / maxStat) * 100}%`,
                        backgroundColor:
                          stat.value >= 100
                            ? "#44ff44"
                            : stat.value >= 60
                            ? "#ffd700"
                            : "#ff4444",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded bg-surface-light px-3 py-2 text-xs text-foreground/50">
              Total:{" "}
              <span className="font-bold text-foreground">
                {pokemon.stats.reduce((sum, s) => sum + s.value, 0)}
              </span>
            </div>

            <h3 className="font-pixel text-xs text-foreground/50 mt-6 mb-3">
              Level-Up Moves
            </h3>
            <div className="max-h-64 overflow-y-auto space-y-1 pr-2">
              {pokemon.moves.length > 0 ? (
                pokemon.moves.map((move) => (
                  <div
                    key={move.name}
                    className="flex justify-between rounded bg-background px-3 py-1.5 text-xs"
                  >
                    <span className="text-foreground/80">
                      {formatPokemonName(move.name)}
                    </span>
                    <span className="text-foreground/40">
                      Lv. {move.level || "—"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-foreground/40">
                  No level-up moves found
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between border-t border-border pt-4">
          {pokemon.id > 1 ? (
            <Link
              href={`/pokedex/${pokemon.id - 1}`}
              className="text-sm text-foreground/50 hover:text-accent transition-colors"
            >
              &larr; #{String(pokemon.id - 1).padStart(3, "0")}
            </Link>
          ) : (
            <span />
          )}
          {pokemon.id < 493 && (
            <Link
              href={`/pokedex/${pokemon.id + 1}`}
              className="text-sm text-foreground/50 hover:text-accent transition-colors"
            >
              #{String(pokemon.id + 1).padStart(3, "0")} &rarr;
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
