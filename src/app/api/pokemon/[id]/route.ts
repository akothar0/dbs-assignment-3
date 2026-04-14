import { NextRequest } from "next/server";
import { getPokemonDetail } from "@/lib/pokeapi/client";
import { toPokemonFull } from "@/lib/pokeapi/helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNum = parseInt(id, 10);

  if (isNaN(idNum) || idNum < 1 || idNum > 493) {
    return Response.json(
      { error: "Invalid Pokemon ID. Must be 1-493 (Gen 1-4)." },
      { status: 400 }
    );
  }

  const data = await getPokemonDetail(idNum);
  return Response.json(toPokemonFull(data));
}
