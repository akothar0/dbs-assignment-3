import { NextRequest } from "next/server";
import { getPokemonList, searchPokemon } from "@/lib/pokeapi/client";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") ?? "24", 10);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  if (query) {
    const results = await searchPokemon(query);
    return Response.json({ pokemon: results, total: results.length });
  }

  const data = await getPokemonList(limit, offset);
  return Response.json(data);
}
