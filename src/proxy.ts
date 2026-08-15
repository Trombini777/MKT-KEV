import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "kev-session";
const ROTAS_PUBLICAS = ["/login", "/solicitacoes"];

function ehRotaPublica(pathname: string): boolean {
  if (pathname === "/") return true;
  return ROTAS_PUBLICAS.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`));
}

/**
 * Guard de rota mock — sem Supabase Auth ainda (ver docs/PLAN.md, M0). Só confere se existe o
 * cookie de sessão marcado por `iniciarSessao()` (src/lib/auth.ts); não valida credencial real.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const logado = request.cookies.has(SESSION_COOKIE);

  if (!logado && !ehRotaPublica(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (logado && pathname === "/login") {
    return NextResponse.redirect(new URL("/painel", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.png).*)"],
};
