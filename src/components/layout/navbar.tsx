"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";

const navLinks = [
  { href: "/pokedex", label: "Pokédex" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/collection", label: "Collection", auth: true },
  { href: "/teams", label: "Teams", auth: true },
  { href: "/battle", label: "Battle", auth: true },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  function linkClass(href: string) {
    const active = pathname === href || pathname.startsWith(href + "/");
    return `text-sm transition-colors ${
      active ? "text-accent font-semibold" : "text-foreground/70 hover:text-accent"
    }`;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-pixel text-sm text-accent hover:text-accent-dim transition-colors"
        >
          PokéArena
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-6">
          {navLinks.map((link) =>
            link.auth ? (
              <Show when="signed-in" key={link.href}>
                <Link href={link.href} className={linkClass(link.href)}>
                  {link.label}
                </Link>
              </Show>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(link.href)}
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
            <Link href="/profile" className={linkClass("/profile")}>
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

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 text-foreground/70 hover:text-accent"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {menuOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile backdrop */}
      {menuOpen && (
        <div
          className="sm:hidden fixed inset-0 top-16 z-40 bg-background/60 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden relative z-50 border-t border-border bg-surface px-4 py-3 space-y-2">
          {navLinks.map((link) =>
            link.auth ? (
              <Show when="signed-in" key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block py-2 ${linkClass(link.href)}`}
                >
                  {link.label}
                </Link>
              </Show>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block py-2 ${linkClass(link.href)}`}
              >
                {link.label}
              </Link>
            )
          )}

          <Show when="signed-out">
            <Link
              href="/sign-in"
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-accent"
            >
              Sign In
            </Link>
          </Show>

          <Show when="signed-in">
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className={`block py-2 ${linkClass("/profile")}`}
            >
              Profile
            </Link>
          </Show>
        </div>
      )}
    </nav>
  );
}
