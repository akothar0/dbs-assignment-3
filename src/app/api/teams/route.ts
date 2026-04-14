import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

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
  const { name } = body;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .insert({
      user_id: userId,
      name: name || "My Team",
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, slot_1, slot_2, slot_3, slot_4, slot_5, slot_6 } = body;

  if (!id) {
    return Response.json({ error: "Team id required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .update({
      name: name || "My Team",
      slot_1: slot_1 ?? null,
      slot_2: slot_2 ?? null,
      slot_3: slot_3 ?? null,
      slot_4: slot_4 ?? null,
      slot_5: slot_5 ?? null,
      slot_6: slot_6 ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Team id required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("teams")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
