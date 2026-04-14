import { createPublicClient } from "@/lib/supabase/public";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") ?? "wins";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);

  const supabase = createPublicClient();

  // Determine sort column
  const orderCol = sort === "caught" ? "total_caught" : "wins";
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("user_id, display_name, avatar_url, wins, losses, total_caught")
    .order(orderCol, { ascending: false })
    .limit(limit);

  if (error || !profiles) {
    return Response.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }

  // Fetch latest team for each user (single query)
  const userIds = profiles.map((p) => p.user_id);
  const { data: teams } = await supabase
    .from("teams")
    .select("id, user_id, slot_1, slot_2, slot_3, slot_4, slot_5, slot_6, updated_at")
    .in("user_id", userIds)
    .order("updated_at", { ascending: false });

  // Pick most recent team per user
  const teamMap = new Map<string, { id: string; slots: number[] }>();
  for (const team of teams ?? []) {
    if (!teamMap.has(team.user_id)) {
      const slots = [team.slot_1, team.slot_2, team.slot_3, team.slot_4, team.slot_5, team.slot_6]
        .filter((s): s is number => s !== null);
      if (slots.length > 0) {
        teamMap.set(team.user_id, { id: team.id, slots });
      }
    }
  }

  // Build ranked response
  let entries = profiles.map((p) => {
    const totalBattles = (p.wins ?? 0) + (p.losses ?? 0);
    return {
      userId: p.user_id,
      displayName: p.display_name ?? "Trainer",
      avatarUrl: p.avatar_url,
      wins: p.wins ?? 0,
      losses: p.losses ?? 0,
      winRate: totalBattles > 0 ? Math.round(((p.wins ?? 0) / totalBattles) * 100) : 0,
      totalCaught: p.total_caught ?? 0,
      team: teamMap.get(p.user_id) ?? null,
    };
  });

  // Re-sort by win rate if requested (computed field, can't sort in DB)
  if (sort === "winrate") {
    entries = entries
      .filter((e) => e.wins + e.losses > 0)
      .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins);
  }

  // Add ranks
  const ranked = entries.map((e, i) => ({ rank: i + 1, ...e }));

  return Response.json(ranked);
}
