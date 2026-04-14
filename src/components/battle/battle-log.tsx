"use client";

import { useEffect, useRef } from "react";
import type { BattleLogEntry } from "@/lib/battle/engine";

interface BattleLogProps {
  entries: BattleLogEntry[];
}

const typeColors: Record<BattleLogEntry["type"], string> = {
  info: "text-foreground/60",
  attack: "text-foreground",
  effective: "text-accent",
  faint: "text-danger",
  switch: "text-success",
  result: "text-accent font-bold",
};

export function BattleLog({ entries }: BattleLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  return (
    <div className="h-32 overflow-y-auto rounded-lg bg-background border border-border p-3 font-pixel text-[9px] leading-relaxed space-y-1">
      {entries.map((entry, i) => (
        <p key={i} className={typeColors[entry.type]}>
          {entry.text}
        </p>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
