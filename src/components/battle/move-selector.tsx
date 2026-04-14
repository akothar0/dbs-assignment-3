"use client";

import { TYPE_COLORS } from "@/lib/pokeapi/helpers";
import type { BattleMove } from "@/lib/battle/engine";

interface MoveSelectorProps {
  moves: BattleMove[];
  onSelect: (index: number) => void;
  disabled: boolean;
}

function formatName(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function MoveSelector({ moves, onSelect, disabled }: MoveSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {moves.map((move, index) => {
        const color = TYPE_COLORS[move.type] ?? "#888";
        return (
          <button
            key={move.name}
            onClick={() => onSelect(index)}
            disabled={disabled}
            className="relative rounded-lg px-3 py-3 text-left transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            style={{
              backgroundColor: `${color}22`,
              borderLeft: `3px solid ${color}`,
            }}
          >
            <span className="block text-sm font-semibold text-foreground">
              {formatName(move.name)}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded text-white"
                style={{ backgroundColor: color }}
              >
                {move.type}
              </span>
              <span className="text-[10px] text-foreground/50">
                PWR {move.power}
              </span>
              <span className="text-[10px] text-foreground/40">
                {move.damageClass === "physical" ? "PHY" : "SPE"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
