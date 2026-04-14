import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  const res = await fetch(`https://pokeapi.co/api/v2/move/${name}`, {
    next: { revalidate: 604800 }, // Cache for 7 days
  });

  if (!res.ok) {
    return Response.json({ error: "Move not found" }, { status: 404 });
  }

  const data = await res.json();

  return Response.json({
    name: data.name,
    power: data.power ?? 0,
    accuracy: data.accuracy,
    type: data.type.name,
    damageClass: data.damage_class.name,
    pp: data.pp,
  });
}
