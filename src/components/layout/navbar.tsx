"use client";

import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";

const navLinks = [
  { href: "/pokedex", label: "Pokédex" },
  { href: "/collection", label: "Collection", auth: true },
  { href: "/teams", label: "Teams", auth: true },
  { href: "/battle", label: "Battle", auth: true },
];

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-pixel text-sm text-accent hover:text-accent-dim transition-colors"
        >
          PokéArena
        </Link>

        <div className="flex items-center gap-6">
          {navLinks.map((link) =>
            link.auth ? (
              <Show when="signed-in" key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-foreground/70 hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              </Show>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground/70 hover:text-accent transition-colors"
              >
                {link.label}
              </Link>
            )
          )}

          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="rounded bg-accent px-3 py-1.5 text-sm font-semibold text-background hover:bg-accent-dim transition-colors"
            >
              Sign In
            </Link>
          </Show>

          <Show when="signed-in">
            <Link
              href="/profile"
              className="text-sm text-foreground/70 hover:text-accent transition-colors"
            >
              Profile
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </Show>
        </div>
      </div>
    </nav>
  );
}
