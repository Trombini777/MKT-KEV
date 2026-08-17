import type { Metadata } from "next";
import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { KevLogo } from "@/components/kev-logo";
import { ResetSenhaForm } from "@/components/reset-senha-form";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Definir nova senha · Kev Marketing",
};

export default function ResetSenhaPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <Card className="border-border/60 py-10">
          <CardHeader className="flex flex-col items-center gap-2 text-center">
            <KevLogo className="h-6 w-auto text-foreground" />
            <p className="text-sm text-muted-foreground">Definir nova senha</p>
          </CardHeader>
          <CardContent className="mt-2">
            <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Carregando…</p>}>
              <ResetSenhaForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
