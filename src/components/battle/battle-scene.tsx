"use client";

import { HpBar } from "@/components/ui/hp-bar";
import { TypeBadge } from "@/components/ui/type-badge";
import type { BattlePokemon } from "@/lib/battle/engine";

interface BattleSceneProps {
  playerPokemon: BattlePokemon;
  opponentPokemon: BattlePokemon;
  playerHit: boolean;
  opponentHit: boolean;
}

function formatName(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function BattleScene({
  playerPokemon,
  opponentPokemon,
  playerHit,
  opponentHit,
}: BattleSceneProps) {
  return (
    <div className="relative rounded-xl bg-gradient-to-b from-surface to-background p-4 min-h-[280px]">
      {/* Opponent (top-right) */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
        <div className="bg-surface/80 rounded-lg px-3 py-2 backdrop-blur-sm min-w-[160px]">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[10px] text-foreground">
              {formatName(opponentPokemon.name)}
            </span>
            <span className="text-[8px] text-foreground/40 ml-2">Lv50</span>
          </div>
          <div className="flex gap-1 mt-1 mb-1">
            {opponentPokemon.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
          <HpBar
            current={opponentPokemon.currentHp}
            max={opponentPokemon.maxHp}
            showText={false}
          />
        </div>
      </div>

      {/* Opponent sprite */}
      <div className="absolute top-12 right-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={opponentPokemon.sprite}
          alt={opponentPokemon.name}
          width={120}
          height={120}
          className={`h-28 w-28 image-rendering-pixelated ${
            opponentHit ? "animate-shake" : ""
          }`}
        />
      </div>

      {/* Player Pokemon info (bottom-right) */}
      <div className="absolute bottom-4 right-4 bg-surface/80 rounded-lg px-3 py-2 backdrop-blur-sm min-w-[180px]">
        <div className="flex items-center justify-between">
          <span className="font-pixel text-[10px] text-foreground">
            {formatName(playerPokemon.name)}
          </span>
          <span className="text-[8px] text-foreground/40 ml-2">Lv50</span>
        </div>
        <div className="flex gap-1 mt-1 mb-1">
          {playerPokemon.types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
        <HpBar
          current={playerPokemon.currentHp}
          max={playerPokemon.maxHp}
        />
      </div>

      {/* Player sprite (bottom-left, back sprite) */}
      <div className="absolute bottom-8 left-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={playerPokemon.backSprite ?? playerPokemon.sprite}
          alt={playerPokemon.name}
          width={120}
          height={120}
          className={`h-28 w-28 image-rendering-pixelated ${
            playerHit ? "animate-shake" : ""
          }`}
        />
      </div>
    </div>
  );
}
