import Link from "next/link";
import { Show } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 text-center">
      {/* Animated Pokeball */}
      <div className="relative mb-8">
        <div className="text-6xl animate-pokeball">●</div>
        <div className="absolute inset-0 rounded-full bg-accent/10 blur-2xl" />
      </div>

      <h1 className="font-pixel text-2xl sm:text-3xl text-accent text-glow mb-4">
        PokéArena
      </h1>
      <p className="font-pixel text-[10px] sm:text-xs text-foreground/50 mb-2 max-w-lg leading-loose">
        Catch all 493 Gen I–IV Pokémon
      </p>
      <p className="font-pixel text-[10px] sm:text-xs text-foreground/50 mb-8 max-w-lg leading-loose">
        Build a team of 6. Battle wild trainers.
      </p>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-2xl w-full">
        <Link href="/pokedex" className="pixel-border rounded-lg bg-surface p-4 hover:bg-surface-light transition-colors">
          <p className="text-2xl mb-2">📖</p>
          <p className="font-pixel text-[9px] text-accent mb-1">POKÉDEX</p>
          <p className="text-xs text-foreground/50">Browse, search, and discover all 493 Pokémon</p>
        </Link>
        <Link href="/collection" className="pixel-border rounded-lg bg-surface p-4 hover:bg-surface-light transition-colors">
          <p className="text-2xl mb-2">⚡</p>
          <p className="font-pixel text-[9px] text-accent mb-1">COLLECT</p>
          <p className="text-xs text-foreground/50">Catch Pokémon, nickname them, build your team</p>
        </Link>
        <Link href="/battle" className="pixel-border rounded-lg bg-surface p-4 hover:bg-surface-light transition-colors">
          <p className="text-2xl mb-2">⚔️</p>
          <p className="font-pixel text-[9px] text-accent mb-1">BATTLE</p>
          <p className="text-xs text-foreground/50">Turn-based battles with type advantages</p>
        </Link>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
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

      <p className="mt-12 text-[10px] text-foreground/20 font-pixel">
        MPCS 51238 · Assignment 3
      </p>
    </div>
  );
}
