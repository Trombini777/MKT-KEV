import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { KevLogo } from "@/components/kev-logo";
import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Entrar · Kev Marketing",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <Card className="border-border/60 py-10">
          <CardHeader className="flex flex-col items-center gap-2 text-center">
            <KevLogo className="h-6 w-auto text-foreground" />
            <p className="text-sm text-muted-foreground">
              Sistema de Gestão de Marketing
            </p>
          </CardHeader>
          <CardContent className="mt-2">
            <LoginForm />
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Acesso restrito ao time de marketing da Kev
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
