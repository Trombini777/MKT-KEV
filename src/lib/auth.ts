"use client";

const SESSION_COOKIE = "kev-session";
const SESSION_MAX_AGE_SEGUNDOS = 60 * 60 * 24 * 30; // 30 dias

/**
 * Login mock — sem Supabase Auth ainda (ver docs/PLAN.md, M0). Aceita qualquer credencial e só
 * marca a sessão via cookie, que o `proxy.ts` lê pra decidir se libera acesso às páginas internas.
 */
export function iniciarSessao() {
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${SESSION_MAX_AGE_SEGUNDOS}`;
}

export function encerrarSessao() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}
