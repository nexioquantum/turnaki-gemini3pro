import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const getBrowserCredentials = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
};

export const createSupabaseBrowserClient = ():
  | SupabaseClient<Database>
  | null => {
  const credentials = getBrowserCredentials();

  if (!credentials) {
    return null;
  }

  return createBrowserClient<Database>(
    credentials.url,
    credentials.anonKey
  );
};

