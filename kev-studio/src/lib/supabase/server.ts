import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { envSupabase } from "@/lib/env";

/**
 * Cliente Supabase do servidor: usado em Server Components e Server Actions.
 * `cookies()` é assíncrono no Next 16; o `setAll` pode falhar quando chamado a partir de um
 * Server Component (não pode escrever cookie fora de Server Function/Route Handler): nesse
 * caso ignora; a renovação de sessão a cada request fica no `proxy.ts` (M2).
 */
export async function createClient() {
  const cookieStore = await cookies();
  const env = envSupabase();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Chamado de dentro de um Server Component: ignora.
        }
      },
    },
  });
}
