"use client";

import { formatPokemonName, getSprite } from "@/lib/pokeapi/helpers";
import { TypeBadge } from "@/components/ui/type-badge";

interface TeamSlotProps {
  slotNumber: number;
  pokemonId: number | null;
  pokemonData?: { name: string; types: string[] } | null;
  onRemove: () => void;
  onSelect: () => void;
}

export function TeamSlot({
  slotNumber,
  pokemonId,
  pokemonData,
  onRemove,
  onSelect,
}: TeamSlotProps) {
  if (!pokemonId || !pokemonData) {
    return (
      <button
        onClick={onSelect}
        className="pixel-border flex h-24 w-full items-center justify-center rounded-lg bg-surface hover:bg-surface-light transition-colors"
      >
        <div className="text-center">
          <span className="text-2xl text-foreground/20">+</span>
          <p className="text-[10px] text-foreground/30 font-pixel mt-1">
            Slot {slotNumber}
          </p>
        </div>
      </button>
    );
  }

  return (
    <div className="pixel-border flex h-24 items-center gap-3 rounded-lg bg-surface px-3 relative group">
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 text-xs text-danger/50 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove"
      >
        ✕
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getSprite(pokemonId)}
        alt={pokemonData.name}
        width={56}
        height={56}
        className="h-14 w-14 image-rendering-pixelated"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {formatPokemonName(pokemonData.name)}
        </p>
        <div className="flex gap-1 mt-1">
          {pokemonData.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>
      </div>
    </div>
  );
}
