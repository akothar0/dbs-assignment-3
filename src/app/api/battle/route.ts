import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { getPokemonDetail } from "@/lib/pokeapi/client";
import { toPokemonFull, getAnimatedSprite, getAnimatedBackSprite, getStaticSprite } from "@/lib/pokeapi/helpers";

const MAX_POKEMON_ID = 493;

// Generate a random opponent team of 3-6 Pokemon
async function generateOpponentTeam(size: number) {
  const ids = new Set<number>();
  while (ids.size < size) {
    ids.add(Math.floor(Math.random() * MAX_POKEMON_ID) + 1);
  }

  const team = await Promise.all(
    Array.from(ids).map(async (id) => {
      const raw = await getPokemonDetail(id);
      const pokemon = toPokemonFull(raw);

      // Pick 4 damaging moves
      const allMoveNames = pokemon.moves.map((m) => m.name);
      const moveDetails = await Promise.all(
        allMoveNames.slice(0, 20).map(async (name) => {
          try {
            const res = await fetch(`https://pokeapi.co/api/v2/move/${name}`, {
              next: { revalidate: 604800 },
            });
            if (!res.ok) return null;
            return res.json();
          } catch {
            return null;
          }
        })
      );

      const damagingMoves = moveDetails
        .filter(
          (m): m is NonNullable<typeof m> =>
            m !== null &&
            m.power > 0 &&
            (m.damage_class.name === "physical" || m.damage_class.name === "special")
        )
        .map((m) => ({
          name: m.name as string,
          power: m.power as number,
          type: m.type.name as string,
          damageClass: m.damage_class.name as "physical" | "special",
        }));

      // Pick up to 4, preferring STAB moves
      const stabMoves = damagingMoves.filter((m) =>
        pokemon.types.includes(m.type)
      );
      const nonStabMoves = damagingMoves.filter(
        (m) => !pokemon.types.includes(m.type)
      );

      const selected = [
        ...stabMoves.slice(0, 2),
        ...nonStabMoves.slice(0, 4 - Math.min(stabMoves.length, 2)),
      ].slice(0, 4);

      // Fallback: Tackle if no moves found
      if (selected.length === 0) {
        selected.push({
          name: "tackle",
          power: 40,
          type: "normal",
          damageClass: "physical",
        });
      }

      return {
        id: pokemon.id,
        name: pokemon.name,
        types: pokemon.types,
        stats: pokemon.stats,
        moves: selected,
        maxHp: 0,
        currentHp: 0,
        sprite: getAnimatedSprite(pokemon.id) ?? getStaticSprite(pokemon.id),
        backSprite: getAnimatedBackSprite(pokemon.id),
      };
    })
  );

  return team;
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action } = body;

  if (action === "generate") {
    // Generate opponent team
    const { teamSize = 3 } = body;
    const size = Math.min(6, Math.max(1, teamSize));
    const opponent = await generateOpponentTeam(size);
    return Response.json({ opponent });
  }

  if (action === "save") {
    // Save battle result
    const { teamId, opponentPokemonIds, result, userRemaining, opponentRemaining, battleLog } = body;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("battle_records")
      .insert({
        user_id: userId,
        user_team_id: teamId || null,
        opponent_pokemon_ids: opponentPokemonIds,
        result,
        user_remaining: userRemaining,
        opponent_remaining: opponentRemaining,
        battle_log: battleLog,
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Update profile wins/losses
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("wins, losses")
        .eq("user_id", userId)
        .single();

      if (profile) {
        const updates =
          result === "win"
            ? { wins: (profile.wins ?? 0) + 1 }
            : { losses: (profile.losses ?? 0) + 1 };
        await supabase.from("profiles").update(updates).eq("user_id", userId);
      }
    } catch {
      // Non-critical
    }

    return Response.json(data, { status: 201 });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}
