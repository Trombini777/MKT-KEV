import "server-only";
import { z } from "zod";

/**
 * Variáveis de ambiente do servidor, validadas com Zod na primeira leitura. Falha com mensagem
 * clara (sem imprimir valores) em vez de quebrar mais adiante com `undefined`.
 */
const esquemaSupabase = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const esquemaServiceRole = esquemaSupabase.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export function supabaseConfigurado(): boolean {
  return esquemaSupabase.safeParse(process.env).success;
}

export function envSupabase() {
  const r = esquemaSupabase.safeParse(process.env);
  if (!r.success) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local"
    );
  }
  return r.data;
}

export function envServiceRole() {
  const r = esquemaServiceRole.safeParse(process.env);
  if (!r.success) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY ausente no .env.local");
  }
  return r.data;
}
