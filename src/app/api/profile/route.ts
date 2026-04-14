import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code === "PGRST116") {
    // Profile doesn't exist yet — create it
    const user = await currentUser();
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        user_id: userId,
        display_name:
          user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.username ?? "Trainer",
        avatar_url: user?.imageUrl ?? null,
      })
      .select()
      .single();

    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500 });
    }
    return Response.json(newProfile);
  }

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
