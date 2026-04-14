import type { PokemonDetail, PokemonSummary, PokemonFull } from "./types";

const MAX_POKEMON_ID = 493; // Gen 1-4

// Gen V Black/White animated sprites (covers all Gen 1-4 Pokemon)
export function getAnimatedSprite(id: number): string | null {
  if (id > MAX_POKEMON_ID) return null;
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
}

export function getAnimatedBackSprite(id: number): string | null {
  if (id > MAX_POKEMON_ID) return null;
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/${id}.gif`;
}

export function getStaticSprite(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export function getSprite(id: number): string {
  return getAnimatedSprite(id) ?? getStaticSprite(id);
}

export function formatPokemonName(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatStatName(name: string): string {
  const statMap: Record<string, string> = {
    hp: "HP",
    attack: "ATK",
    defense: "DEF",
    "special-attack": "SP.ATK",
    "special-defense": "SP.DEF",
    speed: "SPD",
  };
  return statMap[name] ?? name.toUpperCase();
}

export function toPokemonSummary(data: PokemonDetail): PokemonSummary {
  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
    sprite: getStaticSprite(data.id),
    animatedSprite: getAnimatedSprite(data.id),
  };
}

export function toPokemonFull(data: PokemonDetail): PokemonFull {
  // Get moves from the latest relevant version group
  const levelUpMoves = data.moves
    .flatMap((m) =>
      m.version_group_details
        .filter((v) => v.move_learn_method.name === "level-up")
        .map((v) => ({
          name: m.move.name,
          level: v.level_learned_at,
          method: v.move_learn_method.name,
        }))
    )
    .sort((a, b) => a.level - b.level)
    // Deduplicate by move name (keep lowest level)
    .filter(
      (move, index, arr) => arr.findIndex((m) => m.name === move.name) === index
    );

  return {
    id: data.id,
    name: data.name,
    height: data.height,
    weight: data.weight,
    baseExperience: data.base_experience,
    types: data.types.map((t) => t.type.name),
    stats: data.stats.map((s) => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
    abilities: data.abilities.map((a) => ({
      name: a.ability.name,
      isHidden: a.is_hidden,
    })),
    moves: levelUpMoves,
    sprite: getStaticSprite(data.id),
    animatedSprite: getAnimatedSprite(data.id),
    backSprite: data.sprites.back_default,
    animatedBackSprite: getAnimatedBackSprite(data.id),
    officialArtwork:
      data.sprites.other?.["official-artwork"]?.front_default ?? null,
  };
}

// Pokemon type colors for badges
export const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};
