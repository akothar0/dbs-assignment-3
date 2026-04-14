import { calculateDamage } from "./damage";
import { getEffectivenessLabel } from "./type-chart";

// ============================================================
// Types
// ============================================================

export interface BattleMove {
  name: string;
  power: number;
  type: string;
  damageClass: "physical" | "special";
}

export interface BattlePokemon {
  id: number;
  name: string;
  types: string[];
  stats: { name: string; value: number }[];
  moves: BattleMove[];
  maxHp: number;
  currentHp: number;
  sprite: string;
  backSprite: string | null;
}

export interface BattleLogEntry {
  turn: number;
  text: string;
  type: "info" | "attack" | "effective" | "faint" | "switch" | "result";
}

export type BattlePhase =
  | "idle"
  | "ready"
  | "player_turn"
  | "resolving"
  | "faint_switch"
  | "victory"
  | "defeat";

export interface BattleState {
  phase: BattlePhase;
  turn: number;
  playerTeam: BattlePokemon[];
  opponentTeam: BattlePokemon[];
  activePlayerIndex: number;
  activeOpponentIndex: number;
  log: BattleLogEntry[];
  result: "win" | "loss" | null;
}

// ============================================================
// Engine
// ============================================================

function getHp(pokemon: { stats: { name: string; value: number }[] }): number {
  const baseHp = pokemon.stats.find((s) => s.name === "hp")?.value ?? 50;
  // Level 50 HP formula: ((2 * base + 31) * 50 / 100) + 50 + 10
  // Simplified: base + 60 (rough approximation for playability)
  return Math.floor((2 * baseHp * 50) / 100 + 50 + 10);
}

function getSpeed(pokemon: { stats: { name: string; value: number }[] }): number {
  return pokemon.stats.find((s) => s.name === "speed")?.value ?? 50;
}

export function initBattleState(
  playerTeam: BattlePokemon[],
  opponentTeam: BattlePokemon[]
): BattleState {
  // Set HP for all pokemon
  const prepTeam = (team: BattlePokemon[]) =>
    team.map((p) => ({
      ...p,
      maxHp: getHp(p),
      currentHp: getHp(p),
    }));

  return {
    phase: "ready",
    turn: 0,
    playerTeam: prepTeam(playerTeam),
    opponentTeam: prepTeam(opponentTeam),
    activePlayerIndex: 0,
    activeOpponentIndex: 0,
    log: [
      {
        turn: 0,
        text: `A wild trainer appeared with ${opponentTeam.length} Pokémon!`,
        type: "info",
      },
      {
        turn: 0,
        text: `Go, ${playerTeam[0].name}!`,
        type: "switch",
      },
    ],
    result: null,
  };
}

function formatMoveName(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatPokemonName(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Execute a turn: player picks a move, opponent picks randomly.
 * Faster Pokemon attacks first. Returns the new state.
 */
export function executeTurn(
  state: BattleState,
  playerMoveIndex: number
): BattleState {
  const newState = structuredClone(state);
  newState.turn += 1;
  newState.phase = "resolving";

  const player = newState.playerTeam[newState.activePlayerIndex];
  const opponent = newState.opponentTeam[newState.activeOpponentIndex];

  const playerMove = player.moves[playerMoveIndex];

  // Opponent picks a random move
  const opponentMove =
    opponent.moves[Math.floor(Math.random() * opponent.moves.length)];

  // Determine order by speed (tie: player goes first)
  const playerFirst = getSpeed(player) >= getSpeed(opponent);

  const first = playerFirst
    ? { attacker: player, defender: opponent, move: playerMove, isPlayer: true }
    : { attacker: opponent, defender: player, move: opponentMove, isPlayer: false };

  const second = playerFirst
    ? { attacker: opponent, defender: player, move: opponentMove, isPlayer: false }
    : { attacker: player, defender: opponent, move: playerMove, isPlayer: true };

  // Execute first attack
  executeAttack(newState, first.attacker, first.defender, first.move, first.isPlayer);

  // Check if defender fainted
  if (first.defender.currentHp <= 0) {
    handleFaint(newState, !first.isPlayer);
  } else {
    // Execute second attack (only if second attacker is alive)
    if (second.attacker.currentHp > 0) {
      executeAttack(newState, second.attacker, second.defender, second.move, second.isPlayer);

      if (second.defender.currentHp <= 0) {
        handleFaint(newState, !second.isPlayer);
      }
    }
  }

  // Set phase based on result
  if (newState.result) {
    newState.phase = newState.result === "win" ? "victory" : "defeat";
  } else {
    newState.phase = "player_turn";
  }

  return newState;
}

function executeAttack(
  state: BattleState,
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: BattleMove,
  isPlayer: boolean
) {
  const attackerName = formatPokemonName(attacker.name);
  const prefix = isPlayer ? "" : "Foe ";

  state.log.push({
    turn: state.turn,
    text: `${prefix}${attackerName} used ${formatMoveName(move.name)}!`,
    type: "attack",
  });

  const result = calculateDamage(attacker, defender, move);

  defender.currentHp = Math.max(0, defender.currentHp - result.damage);

  const effectLabel = getEffectivenessLabel(result.effectiveness);
  if (effectLabel) {
    state.log.push({ turn: state.turn, text: effectLabel, type: "effective" });
  }

  if (result.isCritical && result.damage > 0) {
    state.log.push({ turn: state.turn, text: "A critical hit!", type: "effective" });
  }
}

function handleFaint(state: BattleState, isPlayer: boolean) {
  if (isPlayer) {
    const fainted = state.playerTeam[state.activePlayerIndex];
    state.log.push({
      turn: state.turn,
      text: `${formatPokemonName(fainted.name)} fainted!`,
      type: "faint",
    });

    // Find next alive Pokemon
    const nextIndex = state.playerTeam.findIndex(
      (p, i) => i > state.activePlayerIndex && p.currentHp > 0
    );

    if (nextIndex === -1) {
      // All player Pokemon fainted
      state.result = "loss";
      state.log.push({
        turn: state.turn,
        text: "You have no more Pokémon! You lost the battle.",
        type: "result",
      });
    } else {
      state.activePlayerIndex = nextIndex;
      const next = state.playerTeam[nextIndex];
      state.log.push({
        turn: state.turn,
        text: `Go, ${formatPokemonName(next.name)}!`,
        type: "switch",
      });
    }
  } else {
    const fainted = state.opponentTeam[state.activeOpponentIndex];
    state.log.push({
      turn: state.turn,
      text: `Foe ${formatPokemonName(fainted.name)} fainted!`,
      type: "faint",
    });

    // Find next alive opponent
    const nextIndex = state.opponentTeam.findIndex(
      (p, i) => i > state.activeOpponentIndex && p.currentHp > 0
    );

    if (nextIndex === -1) {
      // All opponent Pokemon fainted
      state.result = "win";
      state.log.push({
        turn: state.turn,
        text: "You defeated the wild trainer!",
        type: "result",
      });
    } else {
      state.activeOpponentIndex = nextIndex;
      const next = state.opponentTeam[nextIndex];
      state.log.push({
        turn: state.turn,
        text: `The opponent sent out ${formatPokemonName(next.name)}!`,
        type: "switch",
      });
    }
  }
}

/**
 * Get remaining alive count for a team.
 */
export function getAliveCount(team: BattlePokemon[]): number {
  return team.filter((p) => p.currentHp > 0).length;
}
