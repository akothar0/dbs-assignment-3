export interface GymLeader {
  id: string;
  name: string;
  title: string;
  type: string;
  badgeName: string;
  badgeEmoji: string;
  order: number;
  difficulty: number;
  team: number[];
  quote: string;
}

export const GYM_LEADERS: GymLeader[] = [
  {
    id: "rock",
    name: "Brock",
    title: "The Rock-Solid Guardian",
    type: "rock",
    badgeName: "Boulder Badge",
    badgeEmoji: "🪨",
    order: 1,
    difficulty: 1,
    team: [74, 95, 76],
    quote: "My rock-hard willpower will overwhelm you!",
  },
  {
    id: "water",
    name: "Misty",
    title: "The Tomboyish Mermaid",
    type: "water",
    badgeName: "Cascade Badge",
    badgeEmoji: "💧",
    order: 2,
    difficulty: 2,
    team: [121, 130, 131],
    quote: "My water Pokémon will wash you away!",
  },
  {
    id: "electric",
    name: "Lt. Surge",
    title: "The Lightning American",
    type: "electric",
    badgeName: "Thunder Badge",
    badgeEmoji: "⚡",
    order: 3,
    difficulty: 2,
    team: [26, 101, 135, 310],
    quote: "A Pokémon battle is war! I'll show you veteran power!",
  },
  {
    id: "grass",
    name: "Gardenia",
    title: "Master of Vivid Plant Pokémon",
    type: "grass",
    badgeName: "Forest Badge",
    badgeEmoji: "🌿",
    order: 4,
    difficulty: 3,
    team: [407, 465, 389, 3],
    quote: "My Pokémon have deep roots! Can you uproot them?",
  },
  {
    id: "fire",
    name: "Flannery",
    title: "One with a Fiery Passion",
    type: "fire",
    badgeName: "Heat Badge",
    badgeEmoji: "🔥",
    order: 5,
    difficulty: 3,
    team: [59, 136, 324, 392, 78],
    quote: "I've been burning with the desire to battle you!",
  },
  {
    id: "psychic",
    name: "Sabrina",
    title: "The Master of Psychic Pokémon",
    type: "psychic",
    badgeName: "Marsh Badge",
    badgeEmoji: "🔮",
    order: 6,
    difficulty: 4,
    team: [65, 196, 475, 437, 308],
    quote: "I foresaw your arrival. I also foresaw your defeat.",
  },
  {
    id: "ice",
    name: "Candice",
    title: "The Diamond Dust Girl",
    type: "ice",
    badgeName: "Icicle Badge",
    badgeEmoji: "❄️",
    order: 7,
    difficulty: 4,
    team: [473, 478, 461, 365, 471],
    quote: "I'm going to break the ice with my Pokémon!",
  },
  {
    id: "dragon",
    name: "Clair",
    title: "The Blessed User of Dragon Pokémon",
    type: "dragon",
    badgeName: "Rising Badge",
    badgeEmoji: "🐉",
    order: 8,
    difficulty: 5,
    team: [149, 373, 445, 230, 334, 142],
    quote: "Do you think you can stand up to Dragon-type Pokémon?",
  },
];

export function getGymLeader(id: string): GymLeader | undefined {
  return GYM_LEADERS.find((g) => g.id === id);
}
