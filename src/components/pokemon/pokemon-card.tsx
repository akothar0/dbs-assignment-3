import Link from "next/link";
import { TypeBadge } from "@/components/ui/type-badge";
import { formatPokemonName } from "@/lib/pokeapi/helpers";

interface PokemonCardProps {
  id: number;
  name: string;
  types: string[];
  sprite: string;
}

export function PokemonCard({ id, name, types, sprite }: PokemonCardProps) {
  return (
    <Link
      href={`/pokedex/${id}`}
      className="group pixel-border rounded-lg bg-surface p-4 transition-all hover:bg-surface-light hover:scale-[1.02]"
    >
      <div className="relative flex flex-col items-center">
        <span className="absolute top-0 right-0 font-pixel text-[10px] text-foreground/30">
          #{String(id).padStart(3, "0")}
        </span>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sprite}
          alt={name}
          width={80}
          height={80}
          className="h-20 w-20 image-rendering-pixelated"
          loading="lazy"
        />

        <p className="mt-2 text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
          {formatPokemonName(name)}
        </p>

        <div className="mt-1.5 flex gap-1">
          {types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>
      </div>
    </Link>
  );
}
