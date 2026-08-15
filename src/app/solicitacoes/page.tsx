import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { SolicitacaoForm } from "@/components/solicitacao-form";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Nova Solicitação · Kev Marketing",
  description: "Solicite uma demanda ao time de marketing da Kev Seguros",
};

export default function SolicitacaoPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-xl">
        <Card className="border-border/60 py-10">
          <SolicitacaoForm />
        </Card>
      </div>
    </main>
  );
}
