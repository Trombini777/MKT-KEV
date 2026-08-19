"use client";

import { useState } from "react";
import { CardContent, CardHeader } from "@/components/ui/card";
import { KevLogo } from "@/components/kev-logo";
import { Check, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AtividadeFormFields, type DadosAtividade } from "@/components/atividade-form-fields";
import { enviarEmailsNovaSolicitacao } from "@/lib/email-solicitacao";

function CabecalhoSolicitacao({ mostrarDescricao }: { mostrarDescricao: boolean }) {
  return (
    <CardHeader className="flex flex-col items-center gap-2 text-center">
      <KevLogo className="h-6 w-auto text-foreground" />
      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-primary-foreground">
        <Inbox className="size-4" />
        <span className="text-sm font-medium">Solicitações de Marketing</span>
      </div>
      {mostrarDescricao && (
        <p className="max-w-sm text-sm text-muted-foreground">
          Preencha os campos abaixo e envie sua solicitação para o time de marketing da KEV.
        </p>
      )}
    </CardHeader>
  );
}

export function SolicitacaoForm() {
  const [submitted, setSubmitted] = useState(false);

  async function enviar(dados: DadosAtividade): Promise<{ erro?: string } | void> {
    // Rota pública (sem login) — chama a function `criar_solicitacao_publica` via RPC em vez de
    // passar pelo task-store (que exige sessão autenticada por RLS). Ver
    // supabase/migrations/0001_init_schema.sql.
    const supabase = createClient();
    const { error } = await supabase.rpc("criar_solicitacao_publica", {
      p_titulo: dados.titulo,
      p_descricao: dados.descricao,
      p_departamento: dados.departamento,
      p_solicitante_email: dados.solicitanteEmail,
      p_prioridade_sugerida: dados.prioridadeSugerida,
      p_solicitante_nome: dados.solicitanteNome,
      p_justificativa_prioridade: dados.justificativaPrioridade || null,
      p_prazo: dados.prazo || null,
      p_justificativa_prazo: dados.justificativaPrazo || null,
      p_observacoes: dados.observacoes || null,
      p_anexos: dados.anexos,
    });
    if (error) {
      console.error("Falha ao enviar solicitação:", error.message);
      return { erro: "Não foi possível enviar sua solicitação. Tente novamente." };
    }
    // Best-effort, sem bloquear a tela de confirmação: a solicitação já foi registrada acima, o
    // e-mail é só um aviso a mais — uma falha aqui não deve fazer a pessoa achar que o pedido dela
    // não foi recebido.
    enviarEmailsNovaSolicitacao({
      titulo: dados.titulo,
      solicitanteNome: dados.solicitanteNome,
      solicitanteEmail: dados.solicitanteEmail,
      departamento: dados.departamento,
      prazo: dados.prazo || null,
    }).catch((erroEmail) => console.error("Falha ao disparar e-mails da solicitação:", erroEmail));
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <>
        <CabecalhoSolicitacao mostrarDescricao={false} />
        <CardContent className="mt-2">
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-neutral-900 shadow-lg shadow-primary/25 dark:bg-neutral-800">
              <Check className="size-8 text-primary" strokeWidth={3} />
            </div>
            <h2 className="text-lg font-semibold">Solicitação enviada</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Recebemos seu pedido. O time de marketing vai avaliar e você será contatado pelo
              e-mail informado assim que a triagem for feita.
            </p>
          </div>
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CabecalhoSolicitacao mostrarDescricao />
      <CardContent className="mt-2">
        <AtividadeFormFields onSubmit={enviar} />
      </CardContent>
    </>
  );
}
