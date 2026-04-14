import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collected_pokemon")
    .select("*")
    .eq("user_id", userId)
    .order("caught_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { pokemon_id, nickname } = body;

  if (!pokemon_id || pokemon_id < 1 || pokemon_id > 493) {
    return Response.json(
      { error: "Invalid pokemon_id. Must be 1-493." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Catch the Pokemon
  const { data, error } = await supabase
    .from("collected_pokemon")
    .insert({
      user_id: userId,
      pokemon_id,
      nickname: nickname || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return Response.json(
        { error: "You already caught this Pokémon!" },
        { status: 409 }
      );
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Increment total_caught on profile (best effort)
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_caught")
      .eq("user_id", userId)
      .single();
    if (profile) {
      await supabase
        .from("profiles")
        .update({ total_caught: (profile.total_caught ?? 0) + 1 })
        .eq("user_id", userId);
    }
  } catch {
    // Non-critical
  }

  return Response.json(data, { status: 201 });
}

export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const pokemonId = searchParams.get("pokemon_id");

  if (!pokemonId) {
    return Response.json(
      { error: "pokemon_id required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("collected_pokemon")
    .delete()
    .eq("user_id", userId)
    .eq("pokemon_id", parseInt(pokemonId, 10));

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { pokemon_id, nickname, is_favorite } = body;

  if (!pokemon_id) {
    return Response.json(
      { error: "pokemon_id required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const updates: Record<string, unknown> = {};
  if (nickname !== undefined) updates.nickname = nickname || null;
  if (is_favorite !== undefined) updates.is_favorite = is_favorite;

  const { data, error } = await supabase
    .from("collected_pokemon")
    .update(updates)
    .eq("user_id", userId)
    .eq("pokemon_id", pokemon_id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
