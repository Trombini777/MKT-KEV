"use server";

import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioAtual } from "@/lib/usuario-atual";
import { SELECT_TAREFA, linhaParaTarefa } from "@/lib/tarefa-mapper";
import { etapaAtualDe, ehMinhaAtividade } from "@/lib/tarefa-etapa";
import { REGRAS_ESTILO } from "@/lib/kev-estilo";
import type { KevMensagemHistorico } from "@/lib/kev";
import type { Tarefa } from "@/lib/mock";

const TAREFA_ID_SCHEMA = z.string().uuid();

/**
 * Chave de dedup do convite: a linha `planejamento_etapas` específica em que a tarefa está agora
 * (sobrevive a repetições da mesma etapa mais adiante no fluxo, que gerariam uma nova linha).
 * Tarefas sem planejamento aplicado caem no fallback pela fase atual.
 */
function referenciaEtapaAtual(tarefa: Tarefa): string {
  return etapaAtualDe(tarefa).id ?? tarefa.faseAtualId;
}

export type ConviteTarefaKev =
  | { elegivel: false }
  | { elegivel: true; jaConvidado: true }
  | { elegivel: true; jaConvidado: false; mensagem: KevMensagemHistorico };

/**
 * Avalia se o keV deve convidar o usuário logado a ajudar com a tarefa `tarefaId` — só quando ele
 * é o responsável pela etapa atual dela (ver `ehMinhaAtividade`) e ainda não foi convidado nessa
 * etapa específica (ver `kev_convites_atividade`). Quando elegível e ainda não convidado, gera e
 * salva a mensagem de convite (mesmo histórico de `kev_mensagens` de qualquer outra mensagem do
 * keV) e registra o convite pra não repetir.
 */
export async function avaliarConviteTarefaKev(tarefaIdBruto: string): Promise<ConviteTarefaKev> {
  const idValidado = TAREFA_ID_SCHEMA.safeParse(tarefaIdBruto);
  if (!idValidado.success) return { elegivel: false };
  const tarefaId = idValidado.data;

  const usuario = await getUsuarioAtual();
  if (!usuario) return { elegivel: false };

  const supabase = await createClient();
  const { data: row } = await supabase.from("tarefas").select(SELECT_TAREFA).eq("id", tarefaId).maybeSingle();
  if (!row) return { elegivel: false };
  const tarefa = linhaParaTarefa(row);

  // "É a vez dela agir agora" só faz sentido pra tarefa em execução — uma tarefa Concluída,
  // Pausada ou Arquivada pode manter um planejamento com colaborador_id apontando pro usuário
  // (dado stale de quando ainda estava ativa), mas não deve mais disparar convite.
  if (tarefa.statusAtividade !== "Ativa") return { elegivel: false };
  if (!ehMinhaAtividade(tarefa, usuario.id)) return { elegivel: false };

  const etapaRef = referenciaEtapaAtual(tarefa);

  // Insere o convite ANTES de gerar a mensagem: é essa linha (com a unique constraint em
  // colaborador_id+tarefa_id+etapa_ref) que serve de trava atômica contra corrida entre duas
  // avaliações concorrentes pra mesma etapa (duas abas, ou o efeito disparando duas vezes) — quem
  // perder a corrida nem chega a chamar o modelo.
  const { error: erroConvite } = await supabase
    .from("kev_convites_atividade")
    .insert({ colaborador_id: usuario.id, tarefa_id: tarefaId, etapa_ref: etapaRef });
  if (erroConvite) return { elegivel: true, jaConvidado: true };

  const primeiroNome = usuario.nome.split(" ")[0];
  const { text } = await generateText({
    model: openai("gpt-5.4-mini"),
    system:
      `Você é o keV, assistente pessoal de trabalho de ${primeiroNome} na Kev Seguros, que já` +
      ` conversa com ele(a) há um tempo. Tom: calmo, caloroso, direto, genuinamente prestativo.`,
    prompt:
      `${primeiroNome} acabou de abrir o detalhe da atividade "${tarefa.titulo}", e é a vez` +
      ` dele(a) agir nela agora (etapa atual dessa tarefa). Escreva uma mensagem curta oferecendo` +
      ` ajuda especificamente com essa atividade, mencionando o título dela de forma natural (não` +
      ` precisa ser literal), perguntando se ele(a) quer ajuda com essa etapa agora. Isso NÃO é a` +
      ` primeira conversa nem um dia novo: não se apresente, não pergunte apelido.\n\n` +
      `${REGRAS_ESTILO}\n\n` +
      `Máximo uma frase curta. Português do Brasil.`,
  });

  const { data: inserida } = await supabase
    .from("kev_mensagens")
    .insert({ colaborador_id: usuario.id, papel: "assistant", conteudo: text })
    .select("id")
    .single();

  return {
    elegivel: true,
    jaConvidado: false,
    mensagem: { id: inserida?.id ?? crypto.randomUUID(), role: "assistant", texto: text },
  };
}

/**
 * Contexto completo da tarefa `tarefaId` formatado como texto pro system prompt do chat (ver
 * CONTEXTO DA ATIVIDADE EM FOCO em route.ts) — buscado a cada mensagem enquanto o usuário está
 * com o detalhe dessa tarefa aberto na tela, pra refletir o estado real mesmo se ele mudar de
 * etapa no meio da conversa.
 */
export async function buscarContextoTarefaFocada(tarefaIdBruto: string): Promise<string | null> {
  const idValidado = TAREFA_ID_SCHEMA.safeParse(tarefaIdBruto);
  if (!idValidado.success) return null;
  const tarefaId = idValidado.data;

  const supabase = await createClient();
  const { data: row } = await supabase.from("tarefas").select(SELECT_TAREFA).eq("id", tarefaId).maybeSingle();
  if (!row) return null;
  const tarefa = linhaParaTarefa(row);

  const [{ data: colaboradores }, { data: etapasCatalogo }, { data: tipo }] = await Promise.all([
    supabase.from("colaboradores").select("id, nome"),
    supabase.from("etapas").select("id, nome"),
    tarefa.tipoId
      ? supabase.from("tipos_tarefa").select("nome").eq("id", tarefa.tipoId).maybeSingle()
      : Promise.resolve({ data: null as { nome: string } | null }),
  ]);
  const nomePorId = new Map((colaboradores ?? []).map((c) => [c.id, c.nome]));
  const nomeEtapaPorId = new Map((etapasCatalogo ?? []).map((e) => [e.id, e.nome]));
  const atual = etapaAtualDe(tarefa);

  const linhas = [
    `Título: ${tarefa.titulo}`,
    tipo?.nome ? `Tipo de peça: ${tipo.nome}` : null,
    tarefa.descricao ? `Descrição: ${tarefa.descricao}` : null,
    `Prioridade: ${tarefa.prioridadeFinal}`,
    `Prazo final da tarefa: ${tarefa.prazo || "sem prazo"}`,
    atual.etapaId
      ? `Etapa atual: ${nomeEtapaPorId.get(atual.etapaId) ?? atual.etapaId}` +
        (atual.colaboradorId ? ` (responsável: ${nomePorId.get(atual.colaboradorId) ?? "não identificado"})` : "") +
        (atual.dataFim ? `, prazo dessa etapa: ${atual.dataFim}` : "")
      : null,
    tarefa.checklist.length
      ? `Checklist:\n${tarefa.checklist.map((i) => `- [${i.feito ? "x" : " "}] ${i.texto}`).join("\n")}`
      : `Checklist: vazio`,
    tarefa.comentarios.length
      ? `Comentários:\n${tarefa.comentarios
          .map((c) => `- ${nomePorId.get(c.autorId) ?? "alguém"}: ${c.texto}`)
          .join("\n")}`
      : null,
    tarefa.historico.length
      ? `Histórico:\n${tarefa.historico.map((h) => `- ${h.data.slice(0, 10)}: ${h.descricao}`).join("\n")}`
      : null,
  ].filter((l): l is string => Boolean(l));

  return linhas.join("\n");
}
