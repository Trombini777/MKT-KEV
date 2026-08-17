"use server";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioAtual } from "@/lib/usuario-atual";
import { formatarAgoraBrasil, inicioDoDiaBrasilISO } from "@/lib/kev-tempo";
import { ehCargoDeGestao } from "@/lib/kev-cargo";

export type KevMensagemHistorico = {
  id: string;
  role: "user" | "assistant";
  texto: string;
};

const LIMITE_HISTORICO = 40;
const LIMITE_CONTEXTO_ANTERIOR = 20;

const REGRAS_ESTILO =
  `Regras de estilo, sem exceção:\n` +
  `- Não use travessão (—) em nenhuma frase.\n` +
  `- Não ofereça duas leituras com "ou" nas frases de afirmação (nada de "X ou talvez Y").` +
  ` Escolha UMA leitura do momento e comprometa-se com ela em frases curtas e declarativas.\n` +
  `- Escreva em parágrafos bem curtos (1 frase cada, no máximo 2), separados por uma linha em` +
  ` branco entre eles, como alguém mandando algumas mensagens curtas seguidas numa conversa de texto.`;

/**
 * Mensagens de HOJE (fuso de Brasília) do usuário logado com o keV — é o que aparece na tela.
 * Cada novo dia começa uma conversa visualmente "limpa" (ver `gerarSaudacaoKev`); o histórico de
 * dias anteriores continua servindo de contexto de fundo pro keV via `carregarContextoAnteriorKev`.
 */
export async function carregarHistoricoKev(): Promise<KevMensagemHistorico[]> {
  const usuario = await getUsuarioAtual();
  if (!usuario) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("kev_mensagens")
    .select("id, papel, conteudo")
    .eq("colaborador_id", usuario.id)
    .gte("criado_em", inicioDoDiaBrasilISO())
    .order("criado_em", { ascending: true })
    .limit(LIMITE_HISTORICO);

  return (data ?? []).map((m) => ({ id: m.id, role: m.papel as "user" | "assistant", texto: m.conteudo }));
}

/**
 * Resumo em texto das últimas mensagens de DIAS ANTERIORES (não inclui hoje) — injetado no
 * system prompt da conversa (route.ts) como pano de fundo, pra o keV lembrar do que já foi falado
 * mesmo com a tela mostrando só a conversa de hoje. Não é exibido como balão de chat.
 */
export async function carregarContextoAnteriorKev(): Promise<string | null> {
  const usuario = await getUsuarioAtual();
  if (!usuario) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("kev_mensagens")
    .select("papel, conteudo, criado_em")
    .eq("colaborador_id", usuario.id)
    .lt("criado_em", inicioDoDiaBrasilISO())
    .order("criado_em", { ascending: false })
    .limit(LIMITE_CONTEXTO_ANTERIOR);

  if (!data || data.length === 0) return null;

  return data
    .slice()
    .reverse()
    .map((m) => `${m.papel === "user" ? "Usuário" : "keV"}: ${m.conteudo}`)
    .join("\n");
}

/** Apaga todo o histórico de conversa do usuário logado com o keV (uso administrativo). */
export async function apagarConversaKev(): Promise<void> {
  const usuario = await getUsuarioAtual();
  if (!usuario) return;

  const supabase = await createClient();
  await supabase.from("kev_mensagens").delete().eq("colaborador_id", usuario.id);
}

export type SugestaoKev = { label: string; mensagem: string };

const SUGESTOES_GESTAO: SugestaoKev[] = [
  { label: "O que olho primeiro hoje?", mensagem: "O que eu preciso olhar primeiro hoje?" },
  { label: "Carga da equipe", mensagem: "Quem está mais sobrecarregado no time agora?" },
  { label: "Atrasos do time", mensagem: "Quais atividades do time estão atrasadas?" },
  { label: "Aprovações da equipe", mensagem: "O que está aguardando aprovação na equipe?" },
];

const SUGESTOES_OPERACIONAL: SugestaoKev[] = [
  { label: "O que olho primeiro hoje?", mensagem: "O que eu preciso olhar primeiro hoje?" },
  { label: "Minhas atividades atrasadas", mensagem: "Quais das minhas atividades estão atrasadas?" },
  { label: "Aprovações pendentes", mensagem: "O que está aguardando minha aprovação?" },
  { label: "Conhecer o sistema", mensagem: "Me explica como esse sistema funciona e como ele pode me ajudar." },
];

/**
 * Sempre 4 atalhos (nunca 5), diferentes por cargo: gestão vê atalhos de time, operacional vê
 * atalhos pessoais. Usado tanto na primeira conversa quanto em toda vez que a tela reinicia
 * (saudação diária, "Nova conversa").
 */
export async function obterSugestoesKev(): Promise<SugestaoKev[]> {
  const usuario = await getUsuarioAtual();
  if (!usuario) return SUGESTOES_OPERACIONAL;
  return ehCargoDeGestao(usuario.cargo) ? SUGESTOES_GESTAO : SUGESTOES_OPERACIONAL;
}

/**
 * "Nova conversa" no meio do dia: a pessoa quer mudar de assunto, não começar do zero de verdade.
 * A TELA reinicia (ver `novaConversa` em assistant-orb.tsx), mas o histórico em `kev_mensagens`
 * continua intacto, e essa mensagem entra nele como qualquer outra — não é uma re-apresentação,
 * é só o keV reconhecendo a virada de assunto e perguntando o que vem a seguir.
 */
export async function gerarMensagemNovaConversa(): Promise<KevMensagemHistorico | null> {
  const usuario = await getUsuarioAtual();
  if (!usuario) return null;

  const primeiroNome = usuario.nome.split(" ")[0];
  const { text } = await generateText({
    model: openai("gpt-5.4-mini"),
    system:
      `Você é o keV, assistente pessoal de trabalho de ${primeiroNome} na Kev Seguros, que já` +
      ` conversa com ele(a) há um tempo. Tom: calmo, caloroso, direto, genuinamente curioso.`,
    prompt:
      `${primeiroNome} acabou de clicar em "Nova conversa" no meio do dia, sinalizando que quer` +
      ` mudar de assunto. Isso NÃO é a primeira conversa nem um dia novo: não se apresente de` +
      ` novo, não diga quem você é, não pergunte apelido, não comente o horário ou o dia. Escreva` +
      ` só uma pergunta curta e instigante perguntando com o que pode ajudar agora, de um jeito que` +
      ` soe genuinamente interessado, não burocrático nem repetitivo. Não use literalmente "Com` +
      ` que posso te ajudar agora?", varie a forma.\n\n` +
      `${REGRAS_ESTILO}\n\n` +
      `Máximo uma frase curta. Português do Brasil.`,
  });

  const supabase = await createClient();
  const { data } = await supabase
    .from("kev_mensagens")
    .insert({ colaborador_id: usuario.id, papel: "assistant", conteudo: text })
    .select("id")
    .single();

  return { id: data?.id ?? crypto.randomUUID(), role: "assistant", texto: text };
}

/**
 * Gera (e salva) a mensagem de abertura da conversa de HOJE. Se for a primeira vez que a pessoa
 * fala com o keV (nunca, em nenhum dia), é uma apresentação completa. Se já existe histórico de
 * dias anteriores mas nada ainda hoje, é uma saudação diária mais curta, sem repetir a
 * apresentação. Se já tem mensagem hoje (outra aba abriu primeiro), devolve ela em vez de gerar
 * de novo.
 */
export async function gerarSaudacaoKev(): Promise<KevMensagemHistorico | null> {
  const usuario = await getUsuarioAtual();
  if (!usuario) return null;

  const supabase = await createClient();

  const { data: jaFalouHoje } = await supabase
    .from("kev_mensagens")
    .select("id, papel, conteudo")
    .eq("colaborador_id", usuario.id)
    .gte("criado_em", inicioDoDiaBrasilISO())
    .order("criado_em", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (jaFalouHoje) {
    return { id: jaFalouHoje.id, role: jaFalouHoje.papel as "user" | "assistant", texto: jaFalouHoje.conteudo };
  }

  const { data: jaFalouAlgumDia } = await supabase
    .from("kev_mensagens")
    .select("id")
    .eq("colaborador_id", usuario.id)
    .limit(1)
    .maybeSingle();

  const text = jaFalouAlgumDia
    ? await gerarTextoSaudacaoDiaria(usuario)
    : await gerarTextoApresentacao(usuario);

  const { data } = await supabase
    .from("kev_mensagens")
    .insert({ colaborador_id: usuario.id, papel: "assistant", conteudo: text })
    .select("id")
    .single();

  return { id: data?.id ?? crypto.randomUUID(), role: "assistant", texto: text };
}

type UsuarioKev = { nome: string; cargo: string };

/** Apresentação completa — só roda uma vez, na primeira conversa que a pessoa já teve com o keV. */
async function gerarTextoApresentacao(usuario: UsuarioKev): Promise<string> {
  const primeiroNome = usuario.nome.split(" ")[0];
  const focoCapacidades = ehCargoDeGestao(usuario.cargo)
    ? `${primeiroNome} está em posição de coordenação (${usuario.cargo}), então ao explicar com` +
      ` que você ajuda, mencione carga de trabalho do time, gargalos e aprovações da equipe, além` +
      ` das próprias atividades dele(a). A oferta final deve seguir essa linha de gestão.`
    : `O cargo de ${primeiroNome} é operacional (${usuario.cargo}), então ao explicar com que você` +
      ` ajuda, foque nas atividades, prazos e aprovações do próprio ${primeiroNome}. A oferta` +
      ` final deve seguir essa linha pessoal.`;

  const { text } = await generateText({
    model: openai("gpt-5.4-mini"),
    system:
      `Você é o keV, assistente pessoal de trabalho de ${primeiroNome} na Kev Seguros. Tom: ` +
      `calmo, caloroso, direto, como um amigo/assistente executivo que realmente presta atenção, ` +
      `nunca como um sistema anunciando a hora.`,
    prompt:
      `Agora é: ${formatarAgoraBrasil()} (horário de Brasília). Esta é a primeira vez que` +
      ` ${primeiroNome} fala com você. Escreva a mensagem de abertura dessa primeira conversa,` +
      ` cobrindo estes cinco pontos, nessa ordem:\n` +
      `1. Um comentário breve e espontâneo sobre o momento atual (dia da semana, horário, se é` +
      ` madrugada, início ou fim de semana etc.), do jeito que um amigo perceptivo notaria. Você` +
      ` sabe a data e hora exatas, mas nunca escreva a data ou a hora por extenso na mensagem` +
      ` (nada de "segunda-feira, 14:32" ou parecido), só o tom que isso sugere.\n` +
      `2. Uma apresentação de verdade: diga que é bom falar com ${primeiroNome}, se apresente` +
      ` como keV e explique que vai ser o assistente pessoal de trabalho dele(a) na Kev.\n` +
      `3. Uma frase curta dizendo com que tipo de coisa você ajuda. ${focoCapacidades}\n` +
      `4. Avise, de forma leve e sem soar como aviso legal, que você ainda está em fase de` +
      ` treinamento, e que por isso de vez em quando vai perguntar se uma resposta fez sentido, ou` +
      ` convidar ${primeiroNome} a explicar como prefere que algo seja detalhado ou feito.\n` +
      `5. Pergunte como ${primeiroNome} prefere ser chamado(a) (pode ser o primeiro nome mesmo ou` +
      ` um apelido). Diga também que, se ele(a) contar um pouco de como gosta de começar o dia e` +
      ` da própria rotina, você já se ajusta a isso, mas que dá pra configurar ou mudar isso depois` +
      ` a qualquer momento.\n\n` +
      `FORMATO: cada um dos 5 pontos acima vira seu próprio parágrafo curto (pode juntar dois` +
      ` pontos relacionados se ficar mais natural, ex: 4 e 5 podem virar um parágrafo só).\n\n` +
      `${REGRAS_ESTILO}\n` +
      `- O ponto 5 (pergunta do apelido) é a única pergunta da mensagem, e deve ficar por último.\n\n` +
      `Exemplo do tom e formato certos (segunda de manhã, cargo operacional):\n` +
      `"Semana acabou de começar, ainda com aquele silêncio de segunda cedo.\n\n` +
      `Bom te conhecer, Eliezer. Sou o keV, vou ser seu assistente pessoal de trabalho aqui na Kev.\n\n` +
      `Te ajudo a organizar atividades, prazos e aprovações no dia a dia.\n\n` +
      `Ainda estou em fase de treinamento, então de vez em quando vou perguntar se uma resposta` +
      ` fez sentido pra você, ou se quer me explicar como prefere que eu detalhe algo.\n\n` +
      `Como você prefere que eu te chame? E se quiser me contar como gosta de começar o dia, já` +
      ` me ajusto a isso, dá pra mudar quando quiser."\n` +
      `Isso é exemplo de tom e formato, não frases pra copiar. Escreva a sua própria versão,` +
      ` adaptada ao momento real de agora e ao nome de ${primeiroNome}. Português do Brasil.`,
  });
  return text;
}

/** Saudação de um dia novo — mais curta, sem repetir a apresentação, mas ainda comenta o momento. */
async function gerarTextoSaudacaoDiaria(usuario: UsuarioKev): Promise<string> {
  const primeiroNome = usuario.nome.split(" ")[0];
  const ofertaFinal = ehCargoDeGestao(usuario.cargo)
    ? `A oferta final deve ser de foco em gestão (ex: revisar a carga do time, ver aprovações` +
      ` pendentes da equipe), já que ${primeiroNome} está em posição de coordenação (${usuario.cargo}).`
    : `A oferta final deve ser de foco pessoal (ex: organizar as próprias atividades e prazos de` +
      ` ${primeiroNome}), já que o cargo dele(a) é operacional (${usuario.cargo}).`;

  const { text } = await generateText({
    model: openai("gpt-5.4-mini"),
    system:
      `Você é o keV, assistente pessoal de trabalho de ${primeiroNome} na Kev Seguros, que já` +
      ` conversa com ele(a) há um tempo. Tom: calmo, caloroso, direto, como um amigo/assistente` +
      ` executivo que realmente presta atenção, nunca como um sistema anunciando a hora.`,
    prompt:
      `Agora é: ${formatarAgoraBrasil()} (horário de Brasília). É um dia novo de conversa com` +
      ` ${primeiroNome} (vocês já se falaram antes, não é a primeira vez, então NÃO se apresente` +
      ` de novo nem pergunte apelido de novo). Escreva uma saudação curta de abertura: um` +
      ` comentário breve e espontâneo sobre o momento atual (dia da semana, horário, se é` +
      ` madrugada, início ou fim de semana etc.), do jeito que um amigo perceptivo notaria, sem` +
      ` nunca escrever a data ou hora por extenso. Termine com UMA oferta objetiva de ação.` +
      ` ${ofertaFinal}\n\n` +
      `${REGRAS_ESTILO}\n\n` +
      `Exemplo do tom certo: "Semana acabou de começar. Gostaria que eu ajude a organizar suas` +
      ` demandas?" Isso é exemplo de tom, não frase pra copiar. Escreva a sua própria versão,` +
      ` adaptada ao momento real de agora. Máximo 2 frases curtas. Português do Brasil.`,
  });
  return text;
}
