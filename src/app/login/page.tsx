import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { KevMark } from "@/components/kev-mark";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Entrar — Kev Marketing",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <KevMark className="size-6 text-foreground" />
          <span className="text-lg font-bold lowercase tracking-tight">
            kev · marketing
          </span>
        </div>

        <Card className="border-border/60">
          <CardHeader className="text-center">
            <h1 className="text-xl font-semibold tracking-tight">Entrar</h1>
            <p className="text-sm text-muted-foreground">
              Acesse o sistema de gestão de marketing da Kev
            </p>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
