"use client";

interface HpBarProps {
  current: number;
  max: number;
  showText?: boolean;
}

export function HpBar({ current, max, showText = true }: HpBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const color =
    pct > 50 ? "#44ff44" : pct > 20 ? "#ffd700" : "#ff4444";

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <span className="font-pixel text-[8px] text-foreground/60">HP</span>
        <div className="flex-1 h-2.5 bg-background rounded-full overflow-hidden border border-border">
          <div
            className="h-full rounded-full hp-transition"
            style={{
              width: `${pct}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>
      {showText && (
        <p className="text-right text-[10px] text-foreground/50 mt-0.5">
          {current} / {max}
        </p>
      )}
    </div>
  );
}
