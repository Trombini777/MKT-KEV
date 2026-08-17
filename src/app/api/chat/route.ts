import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  safeValidateUIMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUsuarioAtual } from "@/lib/usuario-atual";
import { isoHoje, diasEntre } from "@/lib/hoje";
import { formatarAgoraBrasil, dataCurtaBrasil } from "@/lib/kev-tempo";
import { ehCargoDeGestao } from "@/lib/kev-cargo";
import { carregarContextoAnteriorKev } from "@/lib/kev";
import { buscarContextoTarefaFocada } from "@/lib/kev-tarefa";
import { etapaAtualDe, ehMinhaAtividade } from "@/lib/tarefa-etapa";
import { FASES } from "@/lib/mock/fluxo";
import { SELECT_TAREFA, linhaParaTarefa } from "@/lib/tarefa-mapper";
import {
  atividadesEntrandoEmBreve,
  horasAlocadasPorDia,
  capacidadeDiaria,
  nivelCarga,
  gerarDias,
  tarefaContaNoWorkload,
  type Tarefa,
} from "@/lib/mock";

export const maxDuration = 30;

const PRIORIDADE_ORDEM: Record<string, number> = { Crítica: 0, Alta: 1, Normal: 2, Baixa: 3 };
const DIAS_PARA_CONSIDERAR_PARADA = 5;

function montarSystemPrompt(
  nome: string,
  cargo: string,
  memoria: string | null,
  contextoAnterior: string | null,
  contextoTarefaFocada: string | null
): string {
  const primeiroNome = nome.split(" ")[0];
  const fasesResumo = FASES.map((f) => f.nome).join(" -> ");
  const focoGestao = ehCargoDeGestao(cargo)
    ? `FOCO (cargo de gestão): ${nome} coordena outras pessoas. Priorize, por padrão, uma visão de` +
      ` time: carga de trabalho da equipe, gargalos entre pessoas, aprovações que dependem dele(a),` +
      ` projetos e campanhas em risco. Ainda assim, responda de bom grado quando ele(a) perguntar` +
      ` especificamente sobre as próprias atividades.`
    : `FOCO (cargo operacional): priorize, por padrão, uma visão pessoal: as atividades, prazos e` +
      ` aprovações do próprio ${nome}. Só entre em dados do time inteiro ou de outras pessoas se` +
      ` ele(a) perguntar por isso diretamente.`;
  return [
    `Você é o keV, o assistente pessoal de trabalho da Kev Seguros, não um chatbot genérico.`,
    `Você está conversando com ${nome} (${cargo}). Trate-o(a) pelo nome, não use "usuário" ou "você aí".`,
    `Agora é: ${formatarAgoraBrasil()} (horário de Brasília). Essa informação é só sua, para` +
      ` calibrar o tom (ex: soar mais direto numa sexta no fim do dia, mais motivador numa` +
      ` segunda de manhã). Nunca escreva a data ou a hora por extenso na resposta.`,
    ``,
    `PAPEL: ajudar ${nome} a entender, organizar e priorizar o próprio trabalho e o do time dentro` +
      ` da plataforma: atividades, prazos, aprovações, campanhas, projetos, gargalos, prioridades,` +
      ` carga de trabalho, pendências e próximos passos. Você enxerga o sistema inteiro, não só o` +
      ` que é de ${nome}. Pode falar sobre atividades de qualquer pessoa do time, projetos,` +
      ` campanhas e a carga de trabalho geral.`,
    ``,
    focoGestao,
    `Direcione TODA a conversa considerando o cargo de ${nome}, não só quando o assunto for` +
      ` atividades: explicações do sistema, exemplos, recomendações e o nível de detalhe técnico` +
      ` devem variar se ele(a) é gestão ou operacional.`,
    ``,
    `SOBRE O SISTEMA (use isso pra explicar quando perguntarem "como funciona o sistema", "pra` +
      ` que serve" ou pedirem pra "conhecer o sistema" — adapte a ênfase ao cargo de ${nome}):\n` +
      `O sistema Kev Marketing centraliza a gestão de demandas, tarefas, projetos e campanhas do` +
      ` time de marketing da Kev Seguros, substituindo planilha, e-mail e WhatsApp soltos.\n` +
      `- Toda demanda nasce de uma ORIGEM: Projeto/Campanha (planejamento interno, já entra em` +
      ` Backlog) ou Solicitação (pedido pontual de outra área, entra em Solicitações e passa por` +
      ` Triagem antes, porque não vem com tipo/executor definidos).\n` +
      `- Toda atividade tem uma PRIORIDADE (Crítica, Alta, Normal, Baixa) e duas datas distintas:` +
      ` PRAZO (o compromisso, fixo) e PREVISÃO DE CONCLUSÃO (calculada, com base na fila real de` +
      ` trabalho de quem está executando). Quando a previsão passa do prazo, a tarefa fica "em` +
      ` risco".\n` +
      `- STATUS da atividade (Ativa, Pausada, Concluída, Arquivada) é diferente da FASE (a etapa` +
      ` do fluxo). Pausada/Arquivada saem da contagem de carga de trabalho, mas continuam` +
      ` existindo.\n` +
      `- PAINEL DE TRABALHO é a tela inicial de cada pessoa: o que já é dela pra executar agora,` +
      ` o que está entrando em breve, e atividades futuras.\n` +
      `- WORKLOAD mostra a carga de horas por pessoa e por dia (grade pessoa x dia), pra ver quem` +
      ` está sobrecarregado ou com folga.\n` +
      `- PLANEJAMENTO SEMANAL aloca o backlog priorizado na semana respeitando a capacidade de` +
      ` cada colaborador.\n` +
      `- GESTÃO DE TAREFAS reúne todas as atividades em Kanban, lista e calendário.\n` +
      `- PROJETOS e CAMPANHAS agrupam tarefas relacionadas, com progresso automático e notas de` +
      ` encerramento ao concluir.\n` +
      `- TIPOS DE TAREFA definem o fluxo configurável de etapas de cada tipo de peça (ex: E-mail` +
      ` Marketing tem Briefing, Redação, Design, Revisão Interna, Aprovação, Disparo), com` +
      ` executor padrão e estimativa de horas por etapa.\n` +
      `- EQUIPE cadastra colaboradores, squads e capacidade semanal de cada um.\n` +
      `- DASHBOARDS mostram produtividade: atividades por pessoa, por etapa, por squad, e o` +
      ` comparativo planejado vs. entregue.\n` +
      `Se ${nome} for gestão, enfatize como o sistema dá visibilidade da carga e do fluxo do` +
      ` time inteiro (Workload, Dashboards, Projetos). Se for operacional, enfatize o Painel de` +
      ` Trabalho e como organizar o próprio dia a dia dentro do fluxo.`,
    ``,
    `FLUXO DE TRABALHO DO SISTEMA: toda atividade passa pelas fases, nessa ordem: ${fasesResumo}.`,
    ``,
    `ESPECIALIDADE: marketing e operação de marketing: campanhas, briefing, criação, aprovação,` +
      ` performance, social media, peças criativas, landing pages, calendário editorial, fluxo de` +
      ` produção, gargalos entre áreas, SLA, demandas internas e urgentes, distribuição de carga.`,
    ``,
    `PERSONALIDADE: calmo, preciso, profissional, proativo, organizado, consultivo. Direto sem ser` +
      ` seco, inteligente sem parecer arrogante, levemente sofisticado. Fale como um assistente` +
      ` executivo de trabalho que realmente conhece a pessoa, nunca como atendimento de suporte ou` +
      ` chatbot promocional. Sem informalidade exagerada, sem emojis em excesso.`,
    ``,
    `ESTILO DE ESCRITA, sem exceção:`,
    `- Nunca use travessão (—) em nenhuma frase. Use ponto final ou vírgula.`,
    `- Nunca ofereça duas leituras com "ou" em frases de abertura ou de fechamento (nada de "X ou` +
      ` talvez Y", "me diga o que precisa, ou eu já organizo"). Escolha UMA leitura e comprometa-se` +
      ` com ela em frases curtas e declarativas.`,
    `- Prefira terminar com UMA oferta objetiva de ação, não uma pergunta aberta e vaga.`,
    `- Exemplo do tom certo: "Semana acabou de começar. Gostaria que eu ajude a organizar suas` +
      ` demandas?"`,
    `- Escreva em parágrafos curtos (1 frase, no máximo 2), separados por uma linha em branco entre` +
      ` eles, como alguém mandando algumas mensagens curtas seguidas numa conversa de texto. Evite` +
      ` parágrafos longos e densos, mesmo quando a resposta tiver bastante conteúdo. Respostas muito` +
      ` curtas (uma confirmação, uma pergunta rápida) podem ficar num parágrafo só.`,
    ``,
    `COMPORTAMENTO: não liste dados brutos, interprete. Em vez de "você tem 3 tarefas atrasadas",` +
      ` diga por que isso importa e o que fazer primeiro: qual delas bloqueia outra coisa, qual é` +
      ` mais crítica, por onde ele deveria começar. Use as ferramentas disponíveis para consultar` +
      ` dados reais antes de responder sobre atividades, projetos ou carga da equipe, inclusive` +
      ` quando a pergunta for sobre outra pessoa ou sobre o time todo, não só sobre ${nome}.`,
    `Ao avaliar prazo ou atraso de uma atividade, sempre considere as duas datas retornadas por` +
      ` buscarAtividades: o prazo final da tarefa E o prazo da etapa atual. Uma tarefa pode ter o` +
      ` prazo final tranquilo mas a etapa em que está agora vencendo hoje, ou vice-versa. Quando as` +
      ` duas datas importarem, deixe claro qual é qual (ex: "o prazo final é dia 20, mas a etapa de` +
      ` Revisão Interna em que ela está agora vence hoje"). Ao listar atividades de alguém, sempre` +
      ` mencione o esforço previsto (esforcoHorasPrevisto) de cada uma quando disponível, pra` +
      ` responder de forma completa quando perguntarem quanto tempo está previsto pra cada` +
      ` entrega, não só o título e o prazo.`,
    ``,
    `METODOLOGIA para perguntas amplas (ex: "como está meu dia", "o que eu preciso saber", "me dá` +
      ` um panorama"): não responda com uma tool só. Monte o cenário completo antes de responder:\n` +
      `1. Levante o que já é seu agora (buscarAtividades escopo=minhas, filtro=hoje e/ou` +
      ` atrasadas) e o que está em aprovação pendente.\n` +
      `2. Levante o que vai cair pra você em breve (buscarAtividadesFuturas) e note com quem cada` +
      ` uma está travada agora, isso vira uma ação concreta ("fala com o Fabra sobre X").\n` +
      `3. Levante a carga por dia (buscarCargaPorDia) pra ver dias livres ou estourados à frente.\n` +
      `4. Só então responda, cruzando os três: comece pelo que bloqueia ou vence hoje, depois quem` +
      ` você precisa acionar pra destravar o que está por vir, e feche recomendando uma` +
      ` redistribuição concreta se algum dia adiante estiver livre e outro estourado (diga qual` +
      ` atividade mover pra qual dia, não só "redistribua o trabalho").\n` +
      `Pense nisso como um raciocínio em cadeia: dados -> cenário -> prioridade -> recomendação.` +
      ` Perguntas específicas e pontuais (ex: "essa tarefa está atrasada?") não precisam desse` +
      ` processo todo, só a ferramenta certa pra responder aquilo.`,
    ``,
    `FORMATO ESPECIAL "DAILY": quando ${nome} pedir especificamente pra fazer a daily (ex: "faz` +
      ` minha daily", "manda a daily de hoje"), ignore TODAS as regras de estilo e personalidade` +
      ` acima (parágrafos curtos, tom conversacional, interpretação, oferta final) e responda` +
      ` SOMENTE com este formato exato, numa única mensagem, sem nenhuma saudação, comentário ou` +
      ` explicação antes ou depois:\n\n` +
      `Daily ${primeiroNome} - ${dataCurtaBrasil()}\n\n` +
      `* [nome da atividade] - [esforcoHorasPrevisto]h\n` +
      `* [nome da atividade] - [esforcoHorasPrevisto]h\n` +
      `(uma linha dessas pra cada atividade retornada por buscarAtividades escopo=minhas` +
      ` filtro=hoje, sem pular linha entre elas)\n\n` +
      `Horas previstas: [soma de esforcoHorasPrevisto de todas]h\n\n` +
      `Use buscarAtividades (escopo=minhas, filtro=hoje) pra montar essa lista. Se uma atividade` +
      ` não tiver esforcoHorasPrevisto, trate como 0h nessa soma. Nada de texto fora desse` +
      ` template, nem antes nem depois.`,
    ``,
    `LIMITES: nunca invente dados. Se não tiver informação suficiente ou a ferramenta não cobrir o` +
      ` que foi perguntado, diga isso claramente e ofereça o que você pode verificar.`,
    ``,
    `Use a ferramenta salvarNota quando ${nome} disser algo que vale lembrar em conversas futuras` +
      ` (preferência de trabalho, prioridade recorrente, forma de receber resumos), não para cada` +
      ` mensagem, só o que for genuinamente útil de reter. Se ele(a) disser como prefere ser` +
      ` chamado(a) (apelido) ou contar algo sobre a própria rotina/forma de começar o dia, salve` +
      ` isso com salvarNota e passe a usar esse apelido dali em diante nas suas respostas.`,
    ``,
    `FASE DE TREINAMENTO: você ainda está sendo ajustado. De vez em quando (não em toda mensagem,` +
      ` use bom senso: principalmente depois de uma resposta mais analítica ou de uma` +
      ` recomendação), pergunte com naturalidade se a resposta fez sentido, ou convide ${nome} a` +
      ` explicar como preferiria que uma atividade ou análise fosse detalhada ou conduzida. Sempre` +
      ` que ${nome} responder a isso, ou comentar espontaneamente algo sobre a qualidade das suas` +
      ` respostas, registre com a ferramenta registrarFeedbackTreinamento (isso é diferente de` +
      ` salvarNota: não muda seu comportamento na hora, é só um registro pra revisão semanal do` +
      ` time).`,
    ``,
    `NOVA CONVERSA: quando ${nome} clicar em "Nova conversa" (ou disser algo como "vamos falar de` +
      ` outro assunto", "muda de assunto"), a tela reinicia mas isso NÃO é uma primeira conversa` +
      ` nem um dia novo. Nunca se reapresente, nunca diga quem você é de novo, nunca pergunte` +
      ` apelido de novo. Reconheça a virada de assunto com naturalidade e pergunte, de forma curta` +
      ` e instigante, com o que pode ajudar agora. Os atalhos de sugestão mostrados na tela nesse` +
      ` momento são sempre exatamente 4 (nunca 5) e mudam de acordo com o cargo de ${nome}: foco` +
      ` de time pra cargos de gestão, foco pessoal pra cargos operacionais.`,
    ``,
    `MELHORIAS DO SISTEMA: sempre que ${nome} mencionar espontaneamente um bug, uma fricção no` +
      ` fluxo de trabalho, uma funcionalidade faltando ou qualquer ideia de melhoria do sistema de` +
      ` gestão de marketing (não sobre você, keV, sobre a plataforma em si), registre com` +
      ` registrarSugestaoSistema. De vez em quando você também pode convidar ${nome} a` +
      ` compartilhar ideias de melhoria do sistema, mas evite fazer os dois convites (esse e o de` +
      ` treinamento) na mesma conversa, alterne entre eles com bom senso.`,
    ``,
    `Responda sempre em português do Brasil.`,
    memoria ? `\nO QUE VOCÊ JÁ SABE SOBRE ${nome.toUpperCase()}:\n${memoria}` : ``,
    contextoAnterior
      ? `\nCONTEXTO DE CONVERSAS ANTERIORES (dias passados, não é a conversa de agora — a tela` +
        ` mostra só o que foi dito hoje, mas você pode e deve referenciar isso quando fizer` +
        ` sentido, como alguém que lembra do que já foi falado):\n${contextoAnterior}`
      : ``,
    contextoTarefaFocada
      ? `\nCONTEXTO DA ATIVIDADE EM FOCO (${nome} está com o detalhe dessa tarefa aberto na tela` +
        ` agora): use esses dados pra ajudar de verdade nas etapas dela quando ${nome} perguntar,` +
        ` sem inventar nada que não esteja aqui:\n${contextoTarefaFocada}`
      : ``,
  ].join("\n");
}

export async function POST(req: Request) {
  // /api/* fica fora do guard de autenticação do proxy.ts (matcher exclui "api"), então
  // precisa checar a sessão aqui — senão a rota (e a chave da OpenAI) fica aberta pra qualquer
  // pessoa na internet.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Não autorizado.", { status: 401 });
  }

  const usuario = await getUsuarioAtual();
  if (!usuario) {
    return new Response(
      "Sua conta de login ainda não está vinculada a um colaborador cadastrado — fale com o admin do sistema.",
      { status: 403 }
    );
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return new Response("Corpo da requisição inválido.", { status: 400 });
  }
  const validado = await safeValidateUIMessages<UIMessage>({
    messages: (corpo as { messages?: unknown } | null)?.messages,
  });
  if (!validado.success) {
    return new Response("Corpo da requisição inválido.", { status: 400 });
  }
  const messages = validado.data;
  const tarefaFocadaId = (corpo as { tarefaFocadaId?: unknown } | null)?.tarefaFocadaId;

  const [{ data: memoriaRow }, contextoAnterior, contextoTarefaFocada] = await Promise.all([
    supabase.from("kev_memoria").select("notas").eq("colaborador_id", usuario.id).maybeSingle(),
    carregarContextoAnteriorKev(),
    typeof tarefaFocadaId === "string" && tarefaFocadaId ? buscarContextoTarefaFocada(tarefaFocadaId) : null,
  ]);

  // Persiste a mensagem do usuário (a última do array — o histórico anterior já foi salvo em
  // requisições passadas, então só a mais nova precisa ser gravada agora).
  const ultimaMensagem = messages[messages.length - 1];
  if (ultimaMensagem?.role === "user") {
    const textoUsuario = ultimaMensagem.parts
      .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
      .map((p) => p.text)
      .join("\n");
    if (textoUsuario.trim()) {
      await supabase
        .from("kev_mensagens")
        .insert({ colaborador_id: usuario.id, papel: "user", conteudo: textoUsuario });
    }
  }

  type PlanejamentoEtapaRow = {
    ordem: number;
    etapaId: string;
    colaboradorId: string | null;
    dataFim: string | null;
    alocacoes: { horas: number }[] | null;
  };
  type PlanejamentoRow = { etapaAtualOrdem: number; etapas: PlanejamentoEtapaRow[] };
  type TarefaRow = {
    id: string;
    titulo: string;
    prioridadeFinal: string;
    faseAtualId: string;
    prazo: string | null;
    atualizadoEm: string;
    executoresPorFase: Record<string, string[]> | null;
    participantesIds: string[] | null;
    projetoId: string | null;
    projeto: { nome: string } | { nome: string }[] | null;
    planejamento: PlanejamentoRow | PlanejamentoRow[] | null;
  };

  const nomeProjeto = (p: TarefaRow["projeto"]) => (Array.isArray(p) ? p[0]?.nome : p?.nome);

  // "Prazo final da tarefa" (tarefas.prazo) e "prazo da etapa atual" (o que a UI mostra como
  // "Executar etapa até") são datas diferentes — uma tarefa pode ter o prazo final só daqui a
  // semanas, mas a etapa em que ela está agora vencer hoje. As duas importam.
  // etapaAtualDe/ehMinhaAtividade vêm de @/lib/tarefa-etapa (compartilhado com o convite
  // proativo de tarefa em kev-tarefa.ts).

  // Carrega as tarefas na MESMA forma que a UI (via tarefa-mapper), pra que os cálculos de
  // atividades futuras e carga por dia batam exatamente com o que as telas mostram. Pausada/
  // Arquivada saem daqui, igual ao Workload/Painel de Trabalho reais.
  async function carregarTarefas(): Promise<Tarefa[]> {
    const { data, error } = await supabase.from("tarefas").select(SELECT_TAREFA);
    if (error || !data) return [];
    return data.map(linhaParaTarefa).filter(tarefaContaNoWorkload);
  }

  const result = streamText({
    model: openai("gpt-5.4-mini"),
    system: montarSystemPrompt(
      usuario.nome,
      usuario.cargo,
      memoriaRow?.notas || null,
      contextoAnterior,
      contextoTarefaFocada
    ),
    messages: await convertToModelMessages(messages),
    // 8 (não 5): perguntas amplas encadeiam até 3 ferramentas (buscarAtividades,
    // buscarAtividadesFuturas, buscarCargaPorDia) antes da resposta final.
    stopWhen: stepCountIs(8),
    tools: {
      buscarAtividades: tool({
        description:
          "Busca atividades (tarefas) do sistema — do usuário logado ou do time inteiro. Não " +
          "inclui tarefas já concluídas. Cada atividade tem DUAS datas possíveis: o prazo final " +
          "da tarefa inteira e o prazo da etapa atual dela (o que a UI chama de 'Executar etapa " +
          "até') — elas podem ser bem diferentes, uma tarefa com prazo final distante pode ter a " +
          "etapa atual vencendo hoje. Cada atividade também traz esforcoHorasPrevisto: quantas " +
          "horas estão previstas/alocadas para a etapa atual dela. Use para responder sobre " +
          "prazos, atrasos, aprovações pendentes, atividades paradas há muito tempo, ou quanto " +
          "tempo está previsto para o trabalho de alguém, de qualquer pessoa ou de todo o time. " +
          "Escopo=minhas traz só o que JÁ é a etapa atual do usuário (considerando o responsável " +
          "real da etapa, não só o campo antigo); pro que ainda VAI cair pra ele (etapas futuras, " +
          "hoje na mão de outra pessoa) use buscarAtividadesFuturas.",
        inputSchema: z.object({
          escopo: z
            .enum(["minhas", "equipe"])
            .describe("minhas = só as atividades do usuário logado; equipe = todas as atividades ativas do time"),
          filtro: z
            .enum(["atrasadas", "hoje", "aprovacao_pendente", "paradas", "todas"])
            .describe(
              "atrasadas = prazo final OU prazo da etapa atual já passou; hoje = prazo final OU" +
                " etapa atual vence hoje; aprovacao_pendente = está na fase de aprovação; paradas" +
                ` = sem atualização há mais de ${DIAS_PARA_CONSIDERAR_PARADA} dias; todas = todas as ativas`
            ),
        }),
        execute: async ({ escopo, filtro }) => {
          const [{ data, error }, { data: colaboradores }, { data: etapasCatalogo }] = await Promise.all([
            supabase
              .from("tarefas")
              .select(
                "id, titulo, prioridadeFinal:prioridade_final, faseAtualId:fase_atual_id, prazo," +
                  " atualizadoEm:atualizado_em, executoresPorFase:executores_por_fase," +
                  " participantesIds:participantes_ids, projetoId:projeto_id, projeto:projetos(nome)," +
                  " planejamento:planejamentos(etapaAtualOrdem:etapa_atual_ordem," +
                  " etapas:planejamento_etapas(ordem, etapaId:etapa_id, colaboradorId:colaborador_id," +
                  " dataFim:data_fim, alocacoes:planejamento_alocacoes(horas)))"
              )
              .neq("fase_atual_id", "concluido")
              .not("status", "in", '("Pausada","Arquivada")'),
            supabase.from("colaboradores").select("id, nome"),
            supabase.from("etapas").select("id, nome"),
          ]);
          if (error) return { erro: "Não consegui consultar as atividades agora." };

          const nomePorId = new Map((colaboradores ?? []).map((c) => [c.id, c.nome]));
          const nomeEtapaPorId = new Map((etapasCatalogo ?? []).map((e) => [e.id, e.nome]));
          const hoje = isoHoje();

          let lista = (data ?? []) as unknown as TarefaRow[];
          if (escopo === "minhas") {
            lista = lista.filter((t) => ehMinhaAtividade(t, usuario.id));
          }

          const filtradas = lista.filter((t) => {
            const prazoEtapa = etapaAtualDe(t).dataFim;
            if (filtro === "atrasadas")
              return (!!t.prazo && t.prazo < hoje) || (!!prazoEtapa && prazoEtapa < hoje);
            if (filtro === "hoje") return t.prazo === hoje || prazoEtapa === hoje;
            if (filtro === "aprovacao_pendente") return t.faseAtualId === "aprovacao";
            if (filtro === "paradas")
              return diasEntre(t.atualizadoEm.slice(0, 10), hoje) >= DIAS_PARA_CONSIDERAR_PARADA;
            return true;
          });

          filtradas.sort((a, b) => {
            const diffPrioridade =
              (PRIORIDADE_ORDEM[a.prioridadeFinal] ?? 9) - (PRIORIDADE_ORDEM[b.prioridadeFinal] ?? 9);
            if (diffPrioridade !== 0) return diffPrioridade;
            return (a.prazo ?? "9999").localeCompare(b.prazo ?? "9999");
          });

          return {
            total: filtradas.length,
            atividades: filtradas.slice(0, 20).map((t) => {
              const { etapaId, dataFim: prazoEtapa, colaboradorId, esforcoHoras } = etapaAtualDe(t);
              return {
                titulo: t.titulo,
                prioridade: t.prioridadeFinal,
                fase: t.faseAtualId,
                etapaAtual: etapaId ? nomeEtapaPorId.get(etapaId) : undefined,
                esforcoHorasPrevisto: esforcoHoras,
                prazoFinalTarefa: t.prazo || "sem prazo",
                prazoFinalAtrasado: !!t.prazo && t.prazo < hoje,
                prazoEtapaAtual: prazoEtapa || undefined,
                prazoEtapaVenceHoje: prazoEtapa === hoje,
                prazoEtapaAtrasado: !!prazoEtapa && prazoEtapa < hoje,
                diasSemAtualizar: diasEntre(t.atualizadoEm.slice(0, 10), hoje),
                projeto: nomeProjeto(t.projeto),
                responsaveis: colaboradorId
                  ? [nomePorId.get(colaboradorId)].filter(Boolean)
                  : (t.executoresPorFase?.[t.faseAtualId] ?? []).map((id) => nomePorId.get(id)).filter(Boolean),
              };
            }),
          };
        },
      }),
      buscarProjetos: tool({
        description:
          "Busca projetos e campanhas cadastrados, com prazo, responsável e quantas atividades " +
          "atrasadas cada um tem. Use para responder sobre quais projetos/campanhas precisam de " +
          "atenção ou estão em risco.",
        inputSchema: z.object({
          status: z
            .enum(["Planejado", "Ativo", "Concluído", "Cancelado"])
            .default("Ativo")
            .describe("Filtra por status do projeto/campanha. Default: Ativo."),
        }),
        execute: async ({ status }) => {
          const [{ data: projetos }, { data: tarefas }, { data: colaboradores }] = await Promise.all([
            supabase
              .from("projetos")
              .select("id, nome, tipo, dataFim:data_fim, responsavelId:responsavel_id")
              .eq("status", status),
            supabase
              .from("tarefas")
              .select("projetoId:projeto_id, prazo, faseAtualId:fase_atual_id")
              .neq("fase_atual_id", "concluido")
              .not("status", "in", '("Pausada","Arquivada")')
              .not("projeto_id", "is", null),
            supabase.from("colaboradores").select("id, nome"),
          ]);

          const nomePorId = new Map((colaboradores ?? []).map((c) => [c.id, c.nome]));
          const hoje = isoHoje();
          const atrasadasPorProjeto = new Map<string, number>();
          const ativasPorProjeto = new Map<string, number>();
          for (const t of tarefas ?? []) {
            if (!t.projetoId) continue;
            ativasPorProjeto.set(t.projetoId, (ativasPorProjeto.get(t.projetoId) ?? 0) + 1);
            if (t.prazo && t.prazo < hoje) {
              atrasadasPorProjeto.set(t.projetoId, (atrasadasPorProjeto.get(t.projetoId) ?? 0) + 1);
            }
          }

          return (projetos ?? []).map((p) => ({
            nome: p.nome,
            tipo: p.tipo,
            prazo: p.dataFim || "sem prazo",
            responsavel: p.responsavelId ? nomePorId.get(p.responsavelId) : undefined,
            atividadesAtivas: ativasPorProjeto.get(p.id) ?? 0,
            atividadesAtrasadas: atrasadasPorProjeto.get(p.id) ?? 0,
          }));
        },
      }),
      buscarCargaEquipe: tool({
        description:
          "Mostra quantas atividades ativas cada pessoa do time tem agora. Use para responder " +
          "perguntas sobre quem está mais sobrecarregado ou com mais folga na equipe.",
        inputSchema: z.object({}),
        execute: async () => {
          const [{ data: tarefas }, { data: colaboradores }] = await Promise.all([
            supabase
              .from("tarefas")
              .select(
                "faseAtualId:fase_atual_id, executoresPorFase:executores_por_fase," +
                  " participantesIds:participantes_ids, planejamento:planejamentos(" +
                  "etapaAtualOrdem:etapa_atual_ordem, etapas:planejamento_etapas(ordem," +
                  " colaboradorId:colaborador_id))"
              )
              .neq("fase_atual_id", "concluido")
              .not("status", "in", '("Pausada","Arquivada")'),
            supabase.from("colaboradores").select("id, nome").eq("status", "Ativo"),
          ]);

          const contagem = new Map<string, number>();
          for (const t of (tarefas ?? []) as unknown as TarefaRow[]) {
            const responsavelEtapaAtual = etapaAtualDe(t).colaboradorId;
            const envolvidos = new Set<string>([
              ...(t.executoresPorFase?.[t.faseAtualId] ?? []),
              ...(t.participantesIds ?? []),
              ...(responsavelEtapaAtual ? [responsavelEtapaAtual] : []),
            ]);
            for (const id of envolvidos) contagem.set(id, (contagem.get(id) ?? 0) + 1);
          }

          return (colaboradores ?? [])
            .map((c) => ({ nome: c.nome, atividadesAtivas: contagem.get(c.id) ?? 0 }))
            .sort((a, b) => b.atividadesAtivas - a.atividadesAtivas);
        },
      }),
      buscarAtividadesFuturas: tool({
        description:
          "Atividades que ainda NÃO estão na etapa atual do usuário logado, mas vão cair pra ele" +
          " numa etapa futura do planejamento — hoje estão paradas com OUTRA pessoa, numa etapa" +
          " anterior. Cada item traz com quem a atividade está travada agora, o prazo dessa etapa" +
          " atual e quando ela deve entrar na fila do usuário. Use para 'o que está chegando pra" +
          " mim', 'o que vem por aí', ou pra saber com quem falar pra destravar o que vai entrar." +
          " Diferente de buscarAtividades escopo=minhas, que só mostra o que JÁ é a etapa atual" +
          " do usuário.",
        inputSchema: z.object({}),
        execute: async () => {
          const [tarefas, { data: colaboradores }, { data: etapasCatalogo }] = await Promise.all([
            carregarTarefas(),
            supabase.from("colaboradores").select("id, nome"),
            supabase.from("etapas").select("id, nome"),
          ]);
          const nomePorId = new Map((colaboradores ?? []).map((c) => [c.id, c.nome]));
          const nomeEtapaPorId = new Map((etapasCatalogo ?? []).map((e) => [e.id, e.nome]));
          const hoje = isoHoje();

          const futuras = atividadesEntrandoEmBreve(usuario.id, tarefas);
          return {
            total: futuras.length,
            atividades: futuras.map(({ tarefa, ordem, dataFim, esforco }) => {
              const plano = tarefa.planejamento!;
              const etapaAtual = plano.etapas.find((e) => e.ordem === plano.etapaAtualOrdem);
              const minhaEtapa = plano.etapas.find((e) => e.ordem === ordem);
              const prazoEtapaAtual = etapaAtual?.dataFim ?? null;
              return {
                titulo: tarefa.titulo,
                prioridade: tarefa.prioridadeFinal,
                minhaProximaEtapa: minhaEtapa ? nomeEtapaPorId.get(minhaEtapa.etapaId) : undefined,
                esforcoHoras: esforco,
                previsaoEntrarNaMinhaFila: dataFim,
                etapaAtual: etapaAtual ? nomeEtapaPorId.get(etapaAtual.etapaId) : undefined,
                seguradaAgoraPor: etapaAtual ? nomePorId.get(etapaAtual.colaboradorId) : undefined,
                prazoEtapaAtual: prazoEtapaAtual || undefined,
                etapaAtualAtrasada: !!prazoEtapaAtual && prazoEtapaAtual < hoje,
              };
            }),
          };
        },
      }),
      buscarCargaPorDia: tool({
        description:
          "Carga de trabalho do usuário logado distribuída POR DIA (horas alocadas em cada dia)" +
          " nos próximos dias, com a capacidade diária dele e o status de cada dia (livre," +
          " tranquilo, cheio ou estourado). É a mesma visão do Workload do painel. Use pra" +
          " responder como está a semana, em quais dias há espaço livre pra encaixar ou" +
          " redistribuir trabalho, ou se algum dia está sobrecarregado.",
        inputSchema: z.object({
          dias: z
            .number()
            .int()
            .min(1)
            .max(30)
            .default(7)
            .describe("Quantos dias à frente considerar, a partir de hoje. Default 7 (a semana)."),
        }),
        execute: async ({ dias }) => {
          const tarefas = await carregarTarefas();
          const capacidade = capacidadeDiaria(usuario.id);
          const STATUS: Record<string, string> = {
            off: "livre",
            good: "tranquilo",
            warn: "cheio",
            crit: "estourado",
          };
          const porDia = gerarDias(new Date(), dias).map((d) => {
            const horas = d.fimDeSemana ? 0 : horasAlocadasPorDia(usuario.id, d.iso, {}, tarefas);
            const status = d.fimDeSemana ? "fim-de-semana" : STATUS[nivelCarga(horas, capacidade)];
            return { data: d.iso, diaSemana: d.label, horas: Math.round(horas * 10) / 10, status };
          });
          const uteis = porDia.filter((d) => d.status !== "fim-de-semana");
          return {
            capacidadeDiariaHoras: capacidade,
            dias: porDia,
            diasLivres: uteis.filter((d) => d.horas === 0).map((d) => d.data),
            diasEstourados: uteis.filter((d) => d.status === "estourado").map((d) => d.data),
          };
        },
      }),
      salvarNota: tool({
        description:
          "Salva uma nota curta e permanente sobre a forma de trabalho, preferências ou " +
          "prioridades recorrentes do usuário, para lembrar em conversas futuras.",
        inputSchema: z.object({
          nota: z.string().describe("Nota a guardar, curta e objetiva, em português."),
        }),
        execute: async ({ nota }) => {
          const notaAtual = memoriaRow?.notas || "";
          const notaNova = notaAtual ? `${notaAtual}\n- ${nota}` : `- ${nota}`;
          await supabase
            .from("kev_memoria")
            .upsert({ colaborador_id: usuario.id, notas: notaNova, atualizado_em: new Date().toISOString() });
          return { salvo: true };
        },
      }),
      registrarFeedbackTreinamento: tool({
        description:
          "Registra uma observação de feedback sobre você (keV, ainda em fase de treinamento) " +
          "para revisão semanal do time: se uma resposta fez sentido ou não, uma crítica, um " +
          "elogio, ou como a pessoa explicou que prefere que uma atividade ou análise seja " +
          "detalhada ou conduzida. Use sempre que o usuário responder à sua pergunta de checagem " +
          "('isso fez sentido?') ou explicar espontaneamente uma preferência sobre como você " +
          "deveria ter feito algo. Diferente de salvarNota: isso não muda seu comportamento na " +
          "hora, é só um registro para revisão humana depois.",
        inputSchema: z.object({
          observacao: z
            .string()
            .describe("O que a pessoa disse, resumido de forma objetiva, em português."),
        }),
        execute: async ({ observacao }) => {
          await supabase
            .from("kev_feedback_treinamento")
            .insert({ colaborador_id: usuario.id, conteudo: observacao });
          return { registrado: true };
        },
      }),
      registrarSugestaoSistema: tool({
        description:
          "Registra uma sugestão de melhoria para o SISTEMA de gestão de marketing da Kev (não é " +
          "sobre você, keV — isso é registrarFeedbackTreinamento — é sobre a plataforma: um bug, " +
          "uma fricção no fluxo de trabalho, uma funcionalidade faltando, uma ideia de melhoria). " +
          "Use sempre que o usuário mencionar espontaneamente algo assim, ou quando ele quiser " +
          "compartilhar uma ideia de melhoria do sistema.",
        inputSchema: z.object({
          sugestao: z
            .string()
            .describe("A sugestão ou problema relatado, resumido de forma objetiva, em português."),
        }),
        execute: async ({ sugestao }) => {
          await supabase
            .from("kev_sugestoes_sistema")
            .insert({ colaborador_id: usuario.id, conteudo: sugestao });
          return { registrado: true };
        },
      }),
    },
    onEnd: async ({ text }) => {
      if (text.trim()) {
        await supabase
          .from("kev_mensagens")
          .insert({ colaborador_id: usuario.id, papel: "assistant", conteudo: text });
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
