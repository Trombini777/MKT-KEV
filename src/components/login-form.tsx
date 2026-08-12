"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Tela ainda não conectada ao Supabase Auth — ver docs/PLAN.md, M0.
    setIsSubmitting(true);
    window.setTimeout(() => setIsSubmitting(false), 600);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="voce@kevseguros.com.br"
          autoComplete="email"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <Button type="submit" size="lg" className="mt-1 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
