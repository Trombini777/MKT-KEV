import { CheckCircle2, CircleDashed, XCircle } from "lucide-react";
import { StudioLogo } from "@/components/studio-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { verificarSupabase } from "@/lib/supabase/status";

// A checagem do Supabase precisa rodar a cada request, não no build.
export const dynamic = "force-dynamic";

type Item = { estado: "ok" | "pendente" | "erro"; titulo: string; detalhe: string };

const ICONE = { ok: CheckCircle2, pendente: CircleDashed, erro: XCircle } as const;
const COR = {
  ok: "text-foreground",
  pendente: "text-muted-foreground",
  erro: "text-destructive",
} as const;

export default async function Home() {
  const supabase = await verificarSupabase();

  const itens: Item[] = [
    {
      estado: "ok",
      titulo: "Identidade visual KEV",
      detalhe: "Tema, logo e favicon do Sistema de Marketing",
    },
    supabase.ok
      ? {
          estado: "ok",
          titulo: "Supabase conectado",
          detalhe: `Mesmo projeto do Sistema de Marketing · ${supabase.areas} áreas`,
        }
      : supabase.motivo === "sem-configuracao"
        ? {
            estado: "pendente",
            titulo: "Supabase não configurado",
            detalhe:
              process.env.NODE_ENV === "production"
                ? "Configuração pendente no servidor"
                : "Preencha o .env.local a partir do .env.example",
          }
        : {
            estado: "erro",
            titulo: "Supabase sem resposta",
            detalhe: "Confira a URL e a chave anônima no .env.local",
          },
    {
      estado: "pendente",
      titulo: "Próximo passo: M1",
      detalhe: "Telas do portal com dados de demonstração",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <StudioLogo />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-lg space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Em construção
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance">
              Autoatendimento com IA para as áreas da KEV.
            </h1>
            <p className="text-base text-muted-foreground">
              Apresentações, artes e textos na identidade KEV, em minutos. Campanhas, vídeos e
              peças de maior impacto seguem com o time de Marketing.
            </p>
          </div>

          <Card>
            <CardContent className="divide-y divide-border p-0">
              {itens.map((item) => {
                const Icone = ICONE[item.estado];
                return (
                  <div key={item.titulo} className="flex items-start gap-3 px-5 py-4">
                    <Icone className={`mt-0.5 size-4 shrink-0 ${COR[item.estado]}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.titulo}</p>
                      <p className="text-sm text-muted-foreground">{item.detalhe}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
