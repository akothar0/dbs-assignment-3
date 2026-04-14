import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/layout/navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PokéArena — Collect & Battle",
  description:
    "Catch Gen 1-4 Pokémon, build teams of 6, and battle in a retro DS-style arena.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${pressStart2P.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans antialiased">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#ffd700",
              colorBackground: "#1a1a2e",
              colorText: "#e2e2e2",
              colorInputBackground: "#25253e",
              colorInputText: "#e2e2e2",
            },
          }}
        >
          <Navbar />
          <main className="flex-1">{children}</main>
        </ClerkProvider>
      </body>
    </html>
  );
}
