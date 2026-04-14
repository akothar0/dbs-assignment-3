"use client";

import { useSession } from "@clerk/nextjs";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { useMemo } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export function useSupabase() {
  const { session } = useSession();

  return useMemo(
    () =>
      createSupabaseClient(supabaseUrl, supabaseKey, {
        async accessToken() {
          return session?.getToken() ?? null;
        },
      }),
    [session]
  );
}
