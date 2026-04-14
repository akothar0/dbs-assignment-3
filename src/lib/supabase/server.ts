import { auth } from "@clerk/nextjs/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function createClient() {
  const { getToken } = await auth();

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      return (await getToken()) ?? null;
    },
  });
}
