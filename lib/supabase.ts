import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export type AuthUserLookup = {
  id: string;
  email: string | null;
  created_at: string | null;
};

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Server Components cannot always write cookies. Route handlers and actions can.
        }
      },
      remove(name, options) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // See set().
        }
      }
    }
  });
}

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function findAuthUsersByEmail(query: string) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return [] as AuthUserLookup[];
  }

  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length < 2) {
    return [] as AuthUserLookup[];
  }

  const { data, error } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 200
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data.users ?? [])
    .filter((user) => (user.email ?? "").toLowerCase().includes(normalizedQuery))
    .slice(0, 10)
    .map((user) => ({
      id: user.id,
      email: user.email ?? null,
      created_at: user.created_at ?? null
    }));
}
