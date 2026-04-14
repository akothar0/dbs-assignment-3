import { TYPE_COLORS } from "@/lib/pokeapi/helpers";

export function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] ?? "#888";

  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
      style={{ backgroundColor: color }}
    >
      {type}
    </span>
  );
}
