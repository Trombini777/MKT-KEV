"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { iniciarSessao } from "@/lib/auth";

const FIELD_LABEL_CLASS = "text-xs font-semibold tracking-wider text-muted-foreground uppercase";

export function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Login mock — sem Supabase Auth ainda (ver docs/PLAN.md, M0): aceita qualquer credencial.
    setIsSubmitting(true);
    iniciarSessao();
    router.push("/painel");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className={FIELD_LABEL_CLASS}>
          E-mail
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="voce@kevseguros.com.br"
          autoComplete="email"
          className="h-11"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className={FIELD_LABEL_CLASS}>
          Senha
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="h-11"
          required
        />
      </div>
      <Button type="submit" size="lg" className="mt-1 h-11 w-full text-base" disabled={isSubmitting}>
        {isSubmitting ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
