import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ROTAS_PUBLICAS = ["/login", "/solicitacoes", "/esqueci-senha", "/reset-senha"];

function ehRotaPublica(pathname: string): boolean {
  if (pathname === "/") return true;
  return ROTAS_PUBLICAS.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`));
}

/**
 * Guard de rota via Supabase Auth real. Server Components não conseguem escrever cookie, então
 * é aqui — a cada request — que o token de sessão é renovado antes de chegar nas páginas.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const logado = !!user;

  if (!logado && !ehRotaPublica(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (logado && pathname === "/login") {
    return NextResponse.redirect(new URL("/painel", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|assistente-kev-light.png|assistente-kev-dark.png).*)",
  ],
  // ^ inclui assistente-kev-*.png pois o otimizador do next/image faz fetch interno do
  // arquivo original, sem cookie de sessão — sem essa exceção, o guard bloqueia e a imagem
  // "quebra" mesmo pro usuário logado.
};
