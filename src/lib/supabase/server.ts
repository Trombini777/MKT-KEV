import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente Supabase do servidor — usado em Server Components/Server Actions (login/logout).
 * `cookies()` é assíncrono no Next 16; o `setAll` pode falhar quando chamado a partir de um
 * Server Component (não pode escrever cookie fora de Server Function/Route Handler) — nesse
 * caso ignora, porque o `proxy.ts` já cuida de renovar a sessão a cada request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
            // Chamado de dentro de um Server Component — ignora.
          }
        },
      },
    }
  );
}
