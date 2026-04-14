// Types for PokeAPI responses (Gen 1-4, IDs 1-493)

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: { name: string; url: string }[];
}

export interface PokemonStat {
  base_stat: number;
  stat: { name: string };
}

export interface PokemonType {
  slot: number;
  type: { name: string };
}

export interface PokemonAbility {
  ability: { name: string };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonMove {
  move: { name: string; url: string };
  version_group_details: {
    level_learned_at: number;
    move_learn_method: { name: string };
    version_group: { name: string };
  }[];
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  back_default: string | null;
  other?: {
    "official-artwork"?: {
      front_default: string | null;
    };
  };
  versions?: {
    "generation-v"?: {
      "black-white"?: {
        animated?: {
          front_default: string | null;
          back_default: string | null;
        };
        front_default: string | null;
      };
    };
  };
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  moves: PokemonMove[];
  sprites: PokemonSprites;
}

export interface MoveDetail {
  id: number;
  name: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  type: { name: string };
  damage_class: { name: string }; // "physical" | "special" | "status"
  effect_entries: {
    effect: string;
    short_effect: string;
    language: { name: string };
  }[];
}

// Simplified Pokemon for list views
export interface PokemonSummary {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  animatedSprite: string | null;
}

// Full Pokemon for detail views
export interface PokemonFull {
  id: number;
  name: string;
  height: number;
  weight: number;
  baseExperience: number;
  types: string[];
  stats: { name: string; value: number }[];
  abilities: { name: string; isHidden: boolean }[];
  moves: { name: string; level: number; method: string }[];
  sprite: string;
  animatedSprite: string | null;
  backSprite: string | null;
  animatedBackSprite: string | null;
  officialArtwork: string | null;
}
