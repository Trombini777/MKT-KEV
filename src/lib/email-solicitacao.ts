"use server";

import { Resend } from "resend";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

// Sem domínio verificado no Resend ainda: só dá pra usar o remetente de teste deles
// (onboarding@resend.dev), e nesse modo o Resend só ENTREGA pro e-mail cadastrado na própria
// conta — é limitação deles, não bug daqui. Trocar pra um remetente @kevseguros.com.br assim que
// o domínio for verificado (via /marketplace).
const REMETENTE = "Kev Marketing <onboarding@resend.dev>";

function formatarPrazo(prazo?: string | null): string {
  if (!prazo) return "sem prazo definido";
  const [ano, mes, dia] = prazo.split("-");
  return `${dia}/${mes}/${ano}`;
}

// O formulário de solicitação é público (sem login) — título, nome e departamento vêm direto de
// quem preencheu, sem sanitização. Sem isso, alguém poderia injetar HTML/links no e-mail que o
// aprovador recebe (phishing via um remetente que parece legítimo).
function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function envoltorioEmail(conteudoHtml: string): string {
  return (
    `<div style="background:#f5f5f7;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,` +
    `'Segoe UI',Roboto,sans-serif;">` +
    `<div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;` +
    `overflow:hidden;border:1px solid #d2d2d7;">` +
    `<div style="background:#cff74a;padding:18px 28px;">` +
    `<span style="font-size:15px;font-weight:700;color:#14210a;">Kev Marketing</span>` +
    `</div>` +
    `<div style="padding:28px;color:#1d1d1f;font-size:14px;line-height:1.6;">${conteudoHtml}</div>` +
    `</div>` +
    `<p style="max-width:480px;margin:16px auto 0;text-align:center;font-size:11px;color:#6e6e73;">` +
    `Kev Seguros — sistema interno de gestão de marketing.</p>` +
    `</div>`
  );
}

function templateConfirmacao(dados: DadosNovaSolicitacao): string {
  return envoltorioEmail(
    `<p>Olá, ${escapeHtml(dados.solicitanteNome.split(" ")[0])},</p>` +
      `<p>Recebemos sua solicitação:</p>` +
      `<p style="background:#ebebef;border-radius:10px;padding:14px 16px;margin:16px 0;">` +
      `<b>${escapeHtml(dados.titulo)}</b><br/>` +
      `Departamento: ${escapeHtml(dados.departamento)}<br/>` +
      `Prazo desejado: ${formatarPrazo(dados.prazo)}` +
      `</p>` +
      `<p>O time de marketing vai avaliar e você será contatado pelo e-mail informado assim que a` +
      ` triagem for feita.</p>`
  );
}

function templateAvisoAprovador(dados: DadosNovaSolicitacao, nomeAprovador: string): string {
  return envoltorioEmail(
    `<p>Olá, ${escapeHtml(nomeAprovador.split(" ")[0])},</p>` +
      `<p>Uma nova solicitação chegou e está aguardando aprovação:</p>` +
      `<p style="background:#ebebef;border-radius:10px;padding:14px 16px;margin:16px 0;">` +
      `<b>${escapeHtml(dados.titulo)}</b><br/>` +
      `Solicitante: ${escapeHtml(dados.solicitanteNome)} (${escapeHtml(dados.solicitanteEmail)})<br/>` +
      `Departamento: ${escapeHtml(dados.departamento)}<br/>` +
      `Prazo desejado: ${formatarPrazo(dados.prazo)}` +
      `</p>` +
      `<p>Acesse a aba Solicitações no sistema Kev Marketing pra revisar.</p>`
  );
}

const dadosNovaSolicitacaoSchema = z.object({
  titulo: z.string().trim().min(1),
  solicitanteNome: z.string().trim().min(1),
  solicitanteEmail: z.string().trim().email(),
  departamento: z.string().trim().min(1),
  prazo: z.string().trim().min(1).nullish(),
});

export type DadosNovaSolicitacao = z.infer<typeof dadosNovaSolicitacaoSchema>;

/**
 * Dispara os e-mails da nova solicitação: confirmação pra quem preencheu o formulário público e
 * aviso pro responsável padrão de Aprovação (ver `configuracoes_fluxo`, aba Etapas). Best-effort —
 * chamado sem bloquear a resposta pro usuário (ver solicitacao-form.tsx); falha de e-mail não deve
 * impedir a solicitação de ter sido registrada, que já aconteceu antes desta função ser chamada.
 * É uma Server Action invocável diretamente (sem passar pelo Zod do formulário), por isso valida
 * de novo aqui — fronteira do sistema, por CLAUDE.md.
 */
export async function enviarEmailsNovaSolicitacao(dadosBrutos: DadosNovaSolicitacao): Promise<void> {
  const resultado = dadosNovaSolicitacaoSchema.safeParse(dadosBrutos);
  if (!resultado.success) {
    console.error("Dados inválidos pra e-mail de solicitação:", resultado.error.message);
    return;
  }
  const dados = resultado.data;

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY não configurada — e-mails da solicitação não enviados.");
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  const envios: Promise<void>[] = [
    resend.emails
      .send({
        from: REMETENTE,
        to: dados.solicitanteEmail,
        subject: "Recebemos sua solicitação — Kev Marketing",
        html: templateConfirmacao(dados),
      })
      .then(({ error }) => {
        if (error) console.error("Falha ao enviar e-mail de confirmação:", error.message);
      }),
  ];

  // Service role: quem chama isso é o formulário público (sem sessão de colaborador da Kev), e
  // essas duas tabelas são protegidas por RLS pra quem está autenticado como colaborador — com o
  // client normal a leitura voltaria vazia sem erro e o aprovador nunca seria avisado.
  const supabase = createServiceRoleClient();
  const { data: config } = await supabase
    .from("configuracoes_fluxo")
    .select("responsavel_padrao_aprovacao_id")
    .eq("id", true)
    .maybeSingle();

  if (config?.responsavel_padrao_aprovacao_id) {
    const { data: aprovador } = await supabase
      .from("colaboradores")
      .select("nome, email")
      .eq("id", config.responsavel_padrao_aprovacao_id)
      .maybeSingle();
    if (aprovador?.email) {
      envios.push(
        resend.emails
          .send({
            from: REMETENTE,
            to: aprovador.email,
            subject: `Nova solicitação: ${dados.titulo}`,
            html: templateAvisoAprovador(dados, aprovador.nome),
          })
          .then(({ error }) => {
            if (error) console.error("Falha ao enviar e-mail de aviso ao aprovador:", error.message);
          })
      );
    }
  }

  await Promise.allSettled(envios);
}
