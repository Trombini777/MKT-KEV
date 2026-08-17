"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { solicitarResetSenha } from "@/lib/auth";

const FIELD_LABEL_CLASS = "text-xs font-semibold tracking-wider text-muted-foreground uppercase";

export function EsqueciSenhaForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      await solicitarResetSenha(String(formData.get("email")));
      setEnviado(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (enviado) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="text-sm text-muted-foreground">
          Se esse e-mail estiver cadastrado, você vai receber um link para definir uma senha
          nova.
        </p>
        <a href="/login" className="text-sm text-primary hover:underline">
          Voltar para o login
        </a>
      </div>
    );
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
      <Button type="submit" size="lg" className="mt-1 h-11 w-full text-base" disabled={isSubmitting}>
        {isSubmitting ? "Enviando…" : "Enviar link de recuperação"}
      </Button>
      <a href="/login" className="text-center text-sm text-muted-foreground hover:text-foreground">
        Voltar para o login
      </a>
    </form>
  );
}
