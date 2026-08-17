"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function login(email: string, password: string): Promise<{ erro?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { erro: "E-mail ou senha inválidos." };
  redirect("/painel");
}

/**
 * Sempre retorna sucesso, mesmo se o e-mail não existir ou o Origin faltar — evita enumeração
 * de usuários e nunca deixa vazar erro interno pro cliente.
 */
export async function solicitarResetSenha(email: string): Promise<void> {
  const emailValidado = z.string().email().safeParse(email);
  const origin = (await headers()).get("origin");
  if (!emailValidado.success || !origin) return;

  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(emailValidado.data, {
      redirectTo: `${origin}/reset-senha`,
    });
    // Log só no servidor — a UI mantém a mensagem genérica em qualquer cenário.
    if (error) console.error("[solicitarResetSenha]", error.status, error.message);
  } catch (err) {
    console.error("[solicitarResetSenha] exceção:", err);
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
