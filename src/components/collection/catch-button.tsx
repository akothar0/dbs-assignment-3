"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface CatchButtonProps {
  pokemonId: number;
  pokemonName: string;
  isCaught?: boolean;
}

export function CatchButton({ pokemonId, pokemonName, isCaught: initialCaught = false }: CatchButtonProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isCaught, setIsCaught] = useState(initialCaught);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  async function handleCatch() {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (isCaught) return;

    setIsLoading(true);
    setShowAnimation(true);

    try {
      const res = await fetch("/api/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pokemon_id: pokemonId }),
      });

      if (res.ok) {
        setIsCaught(true);
      } else if (res.status === 409) {
        setIsCaught(true); // Already caught
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowAnimation(false), 1000);
    }
  }

  async function handleRelease() {
    if (!isCaught) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/collection?pokemon_id=${pokemonId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsCaught(false);
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (isCaught) {
    return (
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded bg-success/10 px-3 py-2 text-sm font-semibold text-success">
          <span className="text-base">✓</span> In Collection
        </span>
        <button
          onClick={handleRelease}
          disabled={isLoading}
          className="rounded bg-danger/10 px-3 py-2 text-sm text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
        >
          Release
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleCatch}
      disabled={isLoading}
      className="relative rounded bg-accent px-6 py-2.5 text-sm font-bold text-background hover:bg-accent-dim transition-colors disabled:opacity-50"
    >
      {showAnimation && (
        <span className="absolute inset-0 flex items-center justify-center animate-pokeball text-lg">
          ●
        </span>
      )}
      <span className={showAnimation ? "invisible" : ""}>
        {isLoading ? "Catching..." : `Catch ${pokemonName}!`}
      </span>
    </button>
  );
}
