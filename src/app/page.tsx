import Link from "next/link";
import { Show } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 text-6xl">⚡</div>
      <h1 className="font-pixel text-2xl text-accent text-glow mb-4">
        PokéArena
      </h1>
      <p className="font-pixel text-xs text-foreground/60 mb-8 max-w-md leading-relaxed">
        Catch Gen 1-4 Pokémon. Build your team. Battle wild trainers.
      </p>

      <div className="flex gap-4">
        <Link
          href="/pokedex"
          className="pixel-border rounded bg-surface px-6 py-3 text-sm font-semibold text-foreground hover:bg-surface-light transition-colors"
        >
          Browse Pokédex
        </Link>

        <Show when="signed-out">
          <Link
            href="/sign-up"
            className="rounded bg-accent px-6 py-3 text-sm font-semibold text-background hover:bg-accent-dim transition-colors"
          >
            Start Collecting
          </Link>
        </Show>

        <Show when="signed-in">
          <Link
            href="/collection"
            className="rounded bg-accent px-6 py-3 text-sm font-semibold text-background hover:bg-accent-dim transition-colors"
          >
            My Collection
          </Link>
        </Show>
      </div>
    </div>
  );
}
