"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BattleScene } from "@/components/battle/battle-scene";
import { MoveSelector } from "@/components/battle/move-selector";
import { BattleLog } from "@/components/battle/battle-log";
import { HpBar } from "@/components/ui/hp-bar";
import {
  initBattleState,
  executeTurn,
  getAliveCount,
  type BattleState,
  type BattlePokemon,
} from "@/lib/battle/engine";
import { getAnimatedSprite, getAnimatedBackSprite, getStaticSprite, formatPokemonName } from "@/lib/pokeapi/helpers";
import { getGymLeader } from "@/lib/gyms/gym-data";

interface Team {
  id: string;
  name: string;
  slot_1: number | null;
  slot_2: number | null;
  slot_3: number | null;
  slot_4: number | null;
  slot_5: number | null;
  slot_6: number | null;
}

type PagePhase = "team_select" | "loading" | "battle" | "result";

function BattlePageInner() {
  const { isSignedIn } = useAuth();
  const searchParams = useSearchParams();
  const challengeTeamId = searchParams.get("challenge");
  const challengeTrainerName = searchParams.get("trainer");
  const gymId = searchParams.get("gym");
  const gymLeader = gymId ? getGymLeader(gymId) : null;

  const [phase, setPhase] = useState<PagePhase>("team_select");
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [playerHit, setPlayerHit] = useState(false);
  const [opponentHit, setOpponentHit] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  const [trainerName, setTrainerName] = useState<string | null>(challengeTrainerName);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/teams")
      .then((res) => res.json())
      .then(setTeams);
  }, [isSignedIn]);

  const getTeamSlots = useCallback((team: Team): number[] => {
    return [team.slot_1, team.slot_2, team.slot_3, team.slot_4, team.slot_5, team.slot_6]
      .filter((s): s is number => s !== null);
  }, []);

  async function fetchPlayerTeam(team: Team): Promise<BattlePokemon[]> {
    const slots = getTeamSlots(team);

    const pokemon = await Promise.all(
      slots.map(async (id) => {
        const res = await fetch(`/api/pokemon/${id}`);
        const data = await res.json();

        // Fetch move details for up to 8 moves, pick 4 damaging ones
        const moveNames = data.moves.slice(0, 15).map((m: { name: string }) => m.name);
        const moveDetails = await Promise.all(
          moveNames.map(async (name: string) => {
            try {
              const mRes = await fetch(`/api/pokemon/move/${name}`);
              if (!mRes.ok) {
                // Fallback: fetch directly from PokeAPI via our proxy won't work,
                // so just skip this move
                return null;
              }
              return mRes.json();
            } catch {
              return null;
            }
          })
        );

        const damagingMoves = moveDetails
          .filter(
            (m): m is NonNullable<typeof m> =>
              m !== null && m.power > 0
          )
          .map((m) => ({
            name: m.name,
            power: m.power,
            type: m.type,
            damageClass: m.damageClass as "physical" | "special",
          }))
          .slice(0, 4);

        // Fallback
        if (damagingMoves.length === 0) {
          damagingMoves.push({
            name: "tackle",
            power: 40,
            type: "normal",
            damageClass: "physical" as const,
          });
        }

        return {
          id: data.id,
          name: data.name,
          types: data.types,
          stats: data.stats,
          moves: damagingMoves,
          maxHp: 0,
          currentHp: 0,
          sprite: getAnimatedSprite(data.id) ?? getStaticSprite(data.id),
          backSprite: getAnimatedBackSprite(data.id),
        } as BattlePokemon;
      })
    );

    return pokemon;
  }

  async function startBattle(team: Team) {
    setSelectedTeam(team);
    setPhase("loading");
    setResultSaved(false);

    try {
      const teamSlots = getTeamSlots(team);

      // Fetch player team data and generate/challenge opponent in parallel
      const opponentBody = gymId
        ? { action: "gym", gymId }
        : challengeTeamId
        ? { action: "challenge", challengeTeamId }
        : { action: "generate", teamSize: Math.min(teamSlots.length, 3) };

      const [playerTeam, opponentRes] = await Promise.all([
        fetchPlayerTeam(team),
        fetch("/api/battle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(opponentBody),
        }),
      ]);

      const opponentData = await opponentRes.json();
      if (!opponentRes.ok) {
        throw new Error(opponentData.error ?? "Failed to load opponent");
      }
      const { opponent } = opponentData;
      if (opponentData.trainerName) {
        setTrainerName(opponentData.trainerName);
      }

      const state = initBattleState(playerTeam, opponent);
      if (gymLeader) {
        state.log[0] = { turn: 0, text: `Gym Leader ${gymLeader.name} wants to battle!`, type: "info" };
      } else if (challengeTeamId && trainerName) {
        state.log[0] = { turn: 0, text: `You challenged ${trainerName}!`, type: "info" };
      }
      state.phase = "player_turn";
      setBattleState(state);
      setPhase("battle");
    } catch {
      setPhase("team_select");
    }
  }

  function handleMoveSelect(moveIndex: number) {
    if (!battleState || resolving) return;

    setResolving(true);

    const prevOpponentHp =
      battleState.opponentTeam[battleState.activeOpponentIndex]?.currentHp ?? 0;
    const prevPlayerHp =
      battleState.playerTeam[battleState.activePlayerIndex]?.currentHp ?? 0;

    const newState = executeTurn(battleState, moveIndex);

    const newOpponentHp =
      newState.opponentTeam[newState.activeOpponentIndex]?.currentHp ?? 0;
    const newPlayerHp =
      newState.playerTeam[newState.activePlayerIndex]?.currentHp ?? 0;

    // Trigger hit animations
    if (newOpponentHp < prevOpponentHp) {
      setOpponentHit(true);
      setTimeout(() => setOpponentHit(false), 400);
    }
    if (newPlayerHp < prevPlayerHp) {
      setTimeout(() => {
        setPlayerHit(true);
        setTimeout(() => setPlayerHit(false), 400);
      }, 500);
    }

    // Delay state update for animation feel
    setTimeout(() => {
      setBattleState(newState);
      setResolving(false);

      if (newState.result) {
        setPhase("result");
        saveBattleResult(newState);
      }
    }, 800);
  }

  async function saveBattleResult(state: BattleState) {
    if (resultSaved) return;

    await fetch("/api/battle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save",
        teamId: selectedTeam?.id,
        opponentPokemonIds: state.opponentTeam.map((p) => p.id),
        result: state.result,
        userRemaining: getAliveCount(state.playerTeam),
        opponentRemaining: getAliveCount(state.opponentTeam),
        battleLog: state.log.slice(-20),
        gymId: gymId ?? undefined,
      }),
    });

    setResultSaved(true);
  }

  // ============================================================
  // Render: Team Select
  // ============================================================
  if (phase === "team_select") {
    const validTeams = teams.filter((t) => getTeamSlots(t).length > 0);

    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-pixel text-lg text-accent mb-2">
          {gymLeader ? `Gym Battle: ${gymLeader.name}` : challengeTeamId ? "Challenge Battle" : "Battle Arena"}
        </h1>
        <p className="text-sm text-foreground/60 mb-6">
          {gymLeader
            ? `"${gymLeader.quote}"`
            : challengeTeamId
            ? `Choose your team to battle ${trainerName ?? "this trainer"}!`
            : "Choose a team to battle with. You\u2019ll face a wild trainer!"}
        </p>

        {validTeams.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-pixel text-xs text-foreground/50 mb-4">
              {teams.length === 0
                ? "No teams yet! Create a team first."
                : "Your teams need at least 1 Pokémon."}
            </p>
            <Link
              href="/teams"
              className="rounded bg-accent px-6 py-3 text-sm font-semibold text-background hover:bg-accent-dim transition-colors"
            >
              Go to Teams
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {validTeams.map((team) => {
              const slots = getTeamSlots(team);
              return (
                <button
                  key={team.id}
                  onClick={() => startBattle(team)}
                  className="w-full pixel-border rounded-lg bg-surface p-4 text-left hover:bg-surface-light transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {team.name}
                      </h3>
                      <p className="text-xs text-foreground/50">
                        {slots.length} Pokémon
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {slots.map((id) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={id}
                          src={getAnimatedSprite(id) ?? getStaticSprite(id)}
                          alt=""
                          width={36}
                          height={36}
                          className="h-9 w-9 image-rendering-pixelated"
                        />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // Render: Loading
  // ============================================================
  if (phase === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center">
          <div className="animate-pokeball text-4xl mb-4">●</div>
          <p className="font-pixel text-xs text-accent">
            Preparing battle...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // Render: Battle
  // ============================================================
  if ((phase === "battle" || phase === "result") && battleState) {
    const playerPokemon = battleState.playerTeam[battleState.activePlayerIndex];
    const opponentPokemon = battleState.opponentTeam[battleState.activeOpponentIndex];

    return (
      <div className="mx-auto max-w-2xl px-4 py-4">
        {/* Team HP indicators */}
        <div className="flex justify-between mb-3">
          <div className="flex gap-1">
            {battleState.playerTeam.map((p, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  p.currentHp > 0 ? "bg-success" : "bg-danger/30"
                } ${i === battleState.activePlayerIndex ? "ring-1 ring-accent" : ""}`}
                title={formatPokemonName(p.name)}
              />
            ))}
          </div>
          <div className="flex gap-1">
            {battleState.opponentTeam.map((p, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  p.currentHp > 0 ? "bg-danger" : "bg-foreground/10"
                } ${i === battleState.activeOpponentIndex ? "ring-1 ring-accent" : ""}`}
                title={formatPokemonName(p.name)}
              />
            ))}
          </div>
        </div>

        {/* Battle scene */}
        <BattleScene
          playerPokemon={playerPokemon}
          opponentPokemon={opponentPokemon}
          playerHit={playerHit}
          opponentHit={opponentHit}
        />

        {/* Battle log */}
        <div className="mt-3">
          <BattleLog entries={battleState.log} />
        </div>

        {/* Move selector or result */}
        <div className="mt-3">
          {phase === "result" ? (
            <div className="text-center py-4">
              <h2
                className={`font-pixel text-lg mb-2 ${
                  battleState.result === "win" ? "text-success" : "text-danger"
                }`}
              >
                {battleState.result === "win" ? "VICTORY!" : "DEFEAT"}
              </h2>
              {gymLeader && battleState.result === "win" && (
                <p className="font-pixel text-xs text-accent mb-2">
                  You earned the {gymLeader.badgeName}! {gymLeader.badgeEmoji}
                </p>
              )}
              <p className="text-sm text-foreground/60 mb-4">
                {getAliveCount(battleState.playerTeam)} of your Pokémon survived
              </p>
              <div className="flex gap-3 justify-center">
                {gymId ? (
                  <Link
                    href="/gyms"
                    className="rounded bg-surface px-4 py-2 text-sm text-foreground hover:bg-surface-light transition-colors"
                  >
                    Back to Gyms
                  </Link>
                ) : challengeTeamId ? (
                  <Link
                    href="/leaderboard"
                    className="rounded bg-surface px-4 py-2 text-sm text-foreground hover:bg-surface-light transition-colors"
                  >
                    Back to Leaderboard
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setPhase("team_select");
                      setBattleState(null);
                    }}
                    className="rounded bg-surface px-4 py-2 text-sm text-foreground hover:bg-surface-light transition-colors"
                  >
                    Back to Teams
                  </button>
                )}
                <button
                  onClick={() => selectedTeam && startBattle(selectedTeam)}
                  className="rounded bg-accent px-4 py-2 text-sm font-semibold text-background hover:bg-accent-dim transition-colors"
                >
                  Battle Again
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="font-pixel text-[10px] text-foreground/40 mb-2">
                What will {formatPokemonName(playerPokemon.name)} do?
              </p>
              <MoveSelector
                moves={playerPokemon.moves}
                onSelect={handleMoveSelect}
                disabled={resolving}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

export default function BattlePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="animate-pokeball text-4xl">●</div>
      </div>
    }>
      <BattlePageInner />
    </Suspense>
  );
}
