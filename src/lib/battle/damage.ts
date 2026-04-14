import { getEffectiveness } from "./type-chart";

interface Attacker {
  stats: { name: string; value: number }[];
  types: string[];
}

interface Defender {
  stats: { name: string; value: number }[];
  types: string[];
}

interface Move {
  name: string;
  power: number;
  type: string;
  damageClass: "physical" | "special";
}

function getStat(pokemon: Attacker | Defender, statName: string): number {
  return pokemon.stats.find((s) => s.name === statName)?.value ?? 50;
}

/**
 * Simplified Gen V damage formula.
 * Assumes all Pokemon are level 50.
 * ((2*50/5+2) * power * A/D) / 50 + 2) * STAB * typeEffectiveness * random
 */
export function calculateDamage(
  attacker: Attacker,
  defender: Defender,
  move: Move
): { damage: number; effectiveness: number; isCritical: boolean; isStab: boolean } {
  if (move.power <= 0) {
    return { damage: 0, effectiveness: 1, isCritical: false, isStab: false };
  }

  // Attack and defense stats based on move's damage class
  const atkStat = move.damageClass === "physical" ? "attack" : "special-attack";
  const defStat = move.damageClass === "physical" ? "defense" : "special-defense";

  const A = getStat(attacker, atkStat);
  const D = Math.max(1, getStat(defender, defStat));

  // Level factor: (2 * 50 / 5) + 2 = 22
  const levelFactor = 22;

  // Base damage
  let damage = Math.floor((levelFactor * move.power * A) / (D * 50) + 2);

  // STAB (Same Type Attack Bonus)
  const isStab = attacker.types.includes(move.type);
  if (isStab) {
    damage = Math.floor(damage * 1.5);
  }

  // Type effectiveness
  const effectiveness = getEffectiveness(move.type, defender.types);
  damage = Math.floor(damage * effectiveness);

  // Critical hit (6.25% chance, 1.5x)
  const isCritical = Math.random() < 0.0625;
  if (isCritical) {
    damage = Math.floor(damage * 1.5);
  }

  // Random factor (0.85 - 1.0)
  const random = 0.85 + Math.random() * 0.15;
  damage = Math.max(1, Math.floor(damage * random));

  // Effectiveness of 0 means immune — override damage
  if (effectiveness === 0) {
    damage = 0;
  }

  return { damage, effectiveness, isCritical, isStab };
}
