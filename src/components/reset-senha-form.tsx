"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const FIELD_LABEL_CLASS = "text-xs font-semibold tracking-wider text-muted-foreground uppercase";

type Estado = "validando" | "pronto" | "link-invalido";

export function ResetSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenHash = searchParams.get("token_hash");
  const [estadoLegado, setEstadoLegado] = useState<Estado>("validando");
  const [linkInvalido, setLinkInvalido] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Link novo (token_hash): não valida o token aqui — só ao enviar a senha nova, pra não deixar
  // um scanner de e-mail (Safe Links etc.) consumir o token de uso único ao pré-buscar a página.
  const estado: Estado = tokenHash ? (linkInvalido ? "link-invalido" : "pronto") : estadoLegado;

  useEffect(() => {
    if (tokenHash) return;

    async function verificarSessaoLegado() {
      if (window.location.hash.includes("error=")) {
        return "link-invalido" as const;
      }
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      return data.session ? ("pronto" as const) : ("link-invalido" as const);
    }
    verificarSessaoLegado().then(setEstadoLegado);
  }, [tokenHash]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    if (senha.length < 8) {
      setErro("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (senha !== confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }
    setIsSubmitting(true);
    const supabase = createClient();

    if (tokenHash) {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "recovery",
      });
      if (verifyError) {
        setLinkInvalido(true);
        setIsSubmitting(false);
        return;
      }
    }

    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) {
      setErro("Não foi possível atualizar a senha. Peça um novo link e tente de novo.");
      setIsSubmitting(false);
      return;
    }
    router.replace("/painel");
  }

  if (estado === "validando") {
    return <p className="text-center text-sm text-muted-foreground">Validando link…</p>;
  }

  if (estado === "link-invalido") {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="text-sm text-muted-foreground">
          Esse link de recuperação é inválido ou já expirou.
        </p>
        <a href="/esqueci-senha" className={buttonVariants({ size: "lg", className: "h-11 w-full text-base" })}>
          Pedir um novo link
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="senha" className={FIELD_LABEL_CLASS}>
          Nova senha
        </Label>
        <Input
          id="senha"
          type="password"
          autoComplete="new-password"
          className="h-11"
          required
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmacao" className={FIELD_LABEL_CLASS}>
          Confirmar senha
        </Label>
        <Input
          id="confirmacao"
          type="password"
          autoComplete="new-password"
          className="h-11"
          required
          value={confirmacao}
          onChange={(event) => setConfirmacao(event.target.value)}
        />
      </div>
      {erro && <p className="text-sm text-destructive">{erro}</p>}
      <Button type="submit" size="lg" className="mt-1 h-11 w-full text-base" disabled={isSubmitting}>
        {isSubmitting ? "Salvando…" : "Salvar nova senha"}
      </Button>
    </form>
  );
}
