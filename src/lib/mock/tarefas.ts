import type { Tarefa } from "./types";

export const TAREFAS: Tarefa[] = [
  {
    id: "t1",
    titulo: "Banner institucional da Campanha Dia das Mães",
    descricao:
      "Banner para o site e redes sociais anunciando as condições especiais de seguro de vida no Dia das Mães.",
    tipoId: "banner",
    origem: "Projeto",
    projetoId: "70000000-0000-0000-0000-000000000001",
    quantidadeUnidade: 3,
    prioridadeFinal: "Crítica",
    faseAtualId: "em-execucao",
    statusAtividade: "Ativa",
    etapaAtualId: "revisao-interna",
    execucaoEtapaAte: "2026-08-12",
    dataInicio: "2026-08-12",
    prazo: "2026-08-12",
    previsaoConclusao: "2026-08-13",
    executoresPorFase: { "em-execucao": ["marcos"], aprovacao: ["marcos"] },
    estimativaPorFase: { "em-execucao": 6, aprovacao: 1 },
    participantesIds: ["beatriz"],
    tagIds: ["campanha-sazonal", "seguros-vida"],
    checklist: [
      { id: "c1", texto: "Aplicar identidade da campanha", feito: true },
      { id: "c2", texto: "Revisão ortográfica", feito: true },
      { id: "c3", texto: "Aprovação do jurídico", feito: false },
    ],
    comentarios: [
      {
        id: "cm1",
        autorId: "beatriz",
        texto: "Precisamos publicar até amanhã, o prazo é apertado.",
        data: "2026-08-11T14:00:00",
      },
      {
        id: "cm2",
        autorId: "marcos",
        texto: "Arte pronta, mandei pra aprovação.",
        data: "2026-08-11T17:30:00",
      },
    ],
    historico: [
      { id: "h1", data: "2026-08-05T09:00:00", autorId: "beatriz", descricao: "Tarefa criada no Backlog", faseId: "backlog" },
      { id: "h2", data: "2026-08-05T09:15:00", autorId: "marcos", descricao: "Movida para Em Execução", faseId: "em-execucao" },
    ],
  },
  {
    id: "t2",
    titulo: "Newsletter mensal de renovação de apólice",
    descricao: "E-mail para a base de clientes com apólice vencendo nos próximos 30 dias.",
    tipoId: "email-marketing",
    origem: "Projeto",
    projetoId: "70000000-0000-0000-0000-000000000003",
    prioridadeFinal: "Alta",
    faseAtualId: "em-execucao",
    statusAtividade: "Ativa",
    dataInicio: "2026-08-06",
    prazo: "2026-08-14",
    previsaoConclusao: "2026-08-13",
    executoresPorFase: { "em-execucao": ["diego"], aprovacao: ["marcos"] },
    estimativaPorFase: { "em-execucao": 4, aprovacao: 1 },
    participantesIds: [],
    tagIds: [],
    checklist: [],
    comentarios: [],
    historico: [],
  },
  {
    id: "t3",
    titulo: "Post Instagram com dica de prevenção para o IPVA",
    descricao: "Card educativo sobre prazos e documentos necessários para o IPVA 2026.",
    tipoId: "post-social",
    origem: "Projeto",
    projetoId: "70000000-0000-0000-0000-000000000002",
    quantidadeUnidade: 1,
    prioridadeFinal: "Normal",
    faseAtualId: "em-execucao",
    statusAtividade: "Ativa",
    dataInicio: "2026-08-08",
    prazo: "2026-08-17",
    previsaoConclusao: "2026-08-15",
    executoresPorFase: { "em-execucao": ["carla"], aprovacao: ["marcos"] },
    estimativaPorFase: { "em-execucao": 3, aprovacao: 1 },
    participantesIds: [],
    tagIds: ["seguros-auto", "campanha-sazonal"],
    checklist: [],
    comentarios: [],
    historico: [],
  },
  {
    id: "t4",
    titulo: "Comunicado interno sobre a nova política de sinistros",
    descricao: "Comunicado para o time interno sobre mudanças no fluxo de abertura de sinistros.",
    tipoId: "comunicado-interno",
    origem: "Solicitação",
    solicitanteNome: "Camila Rezende dos Santos",
    solicitanteEmail: "camila.santos@kevseguros.com.br",
    departamento: "Sinistros",
    prioridadeSugerida: "Regular",
    prioridadeFinal: "Baixa",
    faseAtualId: "em-execucao",
    statusAtividade: "Ativa",
    etapaAtualId: "redacao",
    execucaoEtapaAte: "2026-08-13",
    dataInicio: "2026-08-14",
    prazo: "2026-08-20",
    previsaoConclusao: "2026-08-18",
    executoresPorFase: { "em-execucao": ["marcos"], aprovacao: ["marcos"] },
    estimativaPorFase: { "em-execucao": 2, aprovacao: 1 },
    participantesIds: [],
    tagIds: [],
    checklist: [],
    comentarios: [],
    historico: [],
  },
  {
    id: "t5",
    titulo: "Peça para corretor do kit de renovação de frota",
    descricao: "Material de apoio para corretores oferecerem renovação de seguro de frota.",
    tipoId: "peca-corretor",
    origem: "Solicitação",
    solicitanteNome: "Diego de Oliveira Marques da Silva",
    solicitanteEmail: "diego.silva@kevseguros.com.br",
    departamento: "Comercial",
    quantidadeUnidade: 5,
    prioridadeSugerida: "Regular",
    prioridadeFinal: "Normal",
    faseAtualId: "backlog",
    statusAtividade: "Ativa",
    dataInicio: "",
    prazo: "2026-08-22",
    previsaoConclusao: "2026-08-20",
    executoresPorFase: { "em-execucao": ["diego"] },
    estimativaPorFase: { "em-execucao": 4 },
    participantesIds: [],
    tagIds: [],
    checklist: [],
    comentarios: [],
    historico: [],
  },
  {
    id: "t6",
    titulo: "Vídeo curto dos bastidores do sinistro expresso",
    descricao: "Vídeo mostrando como funciona o atendimento de sinistro expresso, pra redes sociais.",
    tipoId: "video",
    origem: "Solicitação",
    solicitanteNome: "Camila Rezende dos Santos",
    solicitanteEmail: "camila.santos@kevseguros.com.br",
    departamento: "Sinistros",
    prioridadeSugerida: "Baixa",
    prioridadeFinal: "Normal",
    faseAtualId: "backlog",
    statusAtividade: "Ativa",
    dataInicio: "",
    prazo: "2026-08-25",
    previsaoConclusao: "2026-08-24",
    executoresPorFase: { "em-execucao": ["rafael"] },
    estimativaPorFase: { "em-execucao": 8 },
    participantesIds: [],
    tagIds: [],
    checklist: [],
    comentarios: [],
    historico: [],
  },
  {
    id: "t7",
    titulo: "Material de campanha do IPVA SP 2026",
    descricao: "Kit completo de peças da campanha de IPVA para todos os canais.",
    tipoId: "material-campanha",
    origem: "Projeto",
    projetoId: "70000000-0000-0000-0000-000000000002",
    quantidadeUnidade: 6,
    prioridadeFinal: "Alta",
    faseAtualId: "aprovacao",
    statusAtividade: "Ativa",
    dataInicio: "2026-07-28",
    prazo: "2026-08-13",
    previsaoConclusao: "2026-08-14",
    executoresPorFase: { "em-execucao": ["marcos"], aprovacao: ["marcos"] },
    estimativaPorFase: { "em-execucao": 10, aprovacao: 2 },
    participantesIds: ["carla"],
    tagIds: ["seguros-auto", "campanha-sazonal"],
    checklist: [
      { id: "c1", texto: "Peças para redes sociais", feito: true },
      { id: "c2", texto: "Peças para e-mail", feito: true },
      { id: "c3", texto: "Peças para site", feito: true },
      { id: "c4", texto: "Aprovação final", feito: false },
    ],
    comentarios: [
      {
        id: "cm1",
        autorId: "marcos",
        texto: "Vou revisar hoje ainda, atrasou um pouco.",
        data: "2026-08-11T10:00:00",
      },
    ],
    historico: [
      { id: "h1", data: "2026-07-28T09:00:00", autorId: "beatriz", descricao: "Tarefa criada no Backlog", faseId: "backlog" },
      { id: "h2", data: "2026-07-29T10:00:00", autorId: "marcos", descricao: "Movida para Em Execução", faseId: "em-execucao" },
      { id: "h3", data: "2026-08-10T16:00:00", autorId: "marcos", descricao: "Movida para Aprovação", faseId: "aprovacao" },
    ],
  },
  {
    id: "t8",
    titulo: "Banner de lançamento da Assistência Financeira",
    descricao: "Banner anunciando o novo produto de Assistência Financeira para o site institucional.",
    tipoId: "banner",
    origem: "Solicitação",
    solicitanteNome: "Rodrigo Almeida Ferreira",
    solicitanteEmail: "rodrigo.ferreira@kevseguros.com.br",
    departamento: "Assistência Financeira",
    quantidadeUnidade: 2,
    justificativaPrioridade:
      "O produto entra no ar na próxima segunda e o banner precisa estar no site antes do envio da campanha de e-mail.",
    observacoes: "Manter o mesmo formato do banner anterior, só trocando as peças visuais.",
    prioridadeSugerida: "Alta",
    prioridadeFinal: "Alta",
    faseAtualId: "solicitacoes",
    statusAtividade: "Ativa",
    dataInicio: "",
    prazo: "",
    previsaoConclusao: "",
    executoresPorFase: {},
    estimativaPorFase: {},
    participantesIds: [],
    tagIds: [],
    checklist: [],
    comentarios: [],
    historico: [
      { id: "h1", data: "2026-08-11T08:20:00", autorId: "beatriz", descricao: "Rodrigo Almeida Ferreira, Assistência Financeira, abriu a solicitação da atividade \"Banner de lançamento da Assistência Financeira\"", faseId: "solicitacoes" },
    ],
  },
  {
    id: "t9",
    titulo: "Post social de aniversário da Kev",
    descricao: "Post comemorativo pelo aniversário da Kev para os perfis oficiais.",
    tipoId: "post-social",
    origem: "Solicitação",
    solicitanteNome: "Beatriz Paiva Carvalho",
    solicitanteEmail: "beatriz.carvalho@kevseguros.com.br",
    departamento: "Diretoria Executiva",
    quantidadeUnidade: 1,
    prioridadeSugerida: "Regular",
    prioridadeFinal: "Normal",
    faseAtualId: "solicitacoes",
    statusAtividade: "Ativa",
    dataInicio: "",
    prazo: "",
    previsaoConclusao: "",
    executoresPorFase: {},
    estimativaPorFase: {},
    participantesIds: [],
    tagIds: [],
    checklist: [],
    comentarios: [],
    historico: [],
  },
  {
    id: "t10",
    titulo: "E-mail com comunicado do RH sobre benefícios",
    descricao: "E-mail interno explicando mudanças no pacote de benefícios.",
    tipoId: "email-marketing",
    origem: "Solicitação",
    solicitanteNome: "Aline Benzecry Souza",
    solicitanteEmail: "aline.souza@kevseguros.com.br",
    departamento: "RH",
    prioridadeSugerida: "Regular",
    prioridadeFinal: "Normal",
    faseAtualId: "triagem",
    statusAtividade: "Ativa",
    dataInicio: "",
    prazo: "",
    previsaoConclusao: "",
    executoresPorFase: {},
    estimativaPorFase: {},
    participantesIds: [],
    tagIds: [],
    checklist: [],
    comentarios: [],
    historico: [],
  },
  {
    id: "t11",
    titulo: "Peça para corretor de material da Bancassurance",
    descricao: "Material comercial para apoiar a equipe de Bancassurance em reuniões com parceiros.",
    tipoId: "peca-corretor",
    origem: "Solicitação",
    solicitanteNome: "Lais Alves Monteiro",
    solicitanteEmail: "lais.monteiro@kevseguros.com.br",
    departamento: "Bancassurance",
    quantidadeUnidade: 4,
    prioridadeSugerida: "Alta",
    prioridadeFinal: "Alta",
    faseAtualId: "triagem",
    statusAtividade: "Ativa",
    dataInicio: "",
    prazo: "",
    previsaoConclusao: "",
    executoresPorFase: {},
    estimativaPorFase: {},
    participantesIds: [],
    tagIds: [],
    checklist: [],
    comentarios: [],
    historico: [],
  },
  {
    id: "t12",
    titulo: "Banner de vaga aberta em Tecnologia",
    descricao: "Banner para divulgar vaga de desenvolvedor no LinkedIn da Kev.",
    tipoId: "banner",
    origem: "Solicitação",
    solicitanteNome: "Thiago Nascimento Ribeiro",
    solicitanteEmail: "thiago.ribeiro@kevseguros.com.br",
    departamento: "Tecnologia",
    quantidadeUnidade: 1,
    prioridadeSugerida: "Baixa",
    prioridadeFinal: "Baixa",
    faseAtualId: "aguardando-info",
    statusAtividade: "Ativa",
    dataInicio: "",
    prazo: "",
    previsaoConclusao: "",
    executoresPorFase: {},
    estimativaPorFase: {},
    participantesIds: [],
    tagIds: [],
    checklist: [],
    comentarios: [
      {
        id: "cm1",
        autorId: "beatriz",
        texto: "Falta o texto da vaga e o link de inscrição, retornei pro solicitante.",
        data: "2026-08-09T11:00:00",
      },
    ],
    historico: [],
  },
  {
    id: "t13",
    titulo: "Vídeo institucional da Diretoria Executiva",
    descricao: "Vídeo institucional para apresentação a investidores.",
    tipoId: "video",
    origem: "Solicitação",
    solicitanteNome: "Beatriz Paiva Carvalho",
    solicitanteEmail: "beatriz.carvalho@kevseguros.com.br",
    departamento: "Diretoria Executiva",
    prioridadeSugerida: "Alta",
    prioridadeFinal: "Crítica",
    faseAtualId: "aguardando-info",
    statusAtividade: "Ativa",
    dataInicio: "",
    prazo: "",
    previsaoConclusao: "",
    executoresPorFase: {},
    estimativaPorFase: {},
    participantesIds: [],
    tagIds: [],
    checklist: [],
    comentarios: [
      {
        id: "cm1",
        autorId: "beatriz",
        texto: "Aguardando roteiro definitivo da Diretoria antes de iniciar produção.",
        data: "2026-08-10T09:00:00",
      },
    ],
    historico: [],
  },
  {
    id: "t14",
    titulo: "Post social teaser da Campanha Dia das Mães",
    descricao: "Post de teaser anunciando a chegada da campanha de Dia das Mães.",
    tipoId: "post-social",
    origem: "Projeto",
    projetoId: "70000000-0000-0000-0000-000000000001",
    quantidadeUnidade: 1,
    prioridadeFinal: "Normal",
    faseAtualId: "concluido",
    statusAtividade: "Ativa",
    dataInicio: "2026-07-20",
    prazo: "2026-07-30",
    previsaoConclusao: "2026-07-29",
    executoresPorFase: { "em-execucao": ["carla"], aprovacao: ["marcos"] },
    estimativaPorFase: { "em-execucao": 2, aprovacao: 0.5 },
    participantesIds: [],
    tagIds: ["campanha-sazonal"],
    checklist: [],
    comentarios: [],
    historico: [],
  },
  {
    id: "t15",
    titulo: "Comunicado interno de kickoff do IPVA",
    descricao: "Comunicado avisando o time interno sobre o início da campanha de IPVA.",
    tipoId: "comunicado-interno",
    origem: "Projeto",
    projetoId: "70000000-0000-0000-0000-000000000002",
    prioridadeFinal: "Normal",
    faseAtualId: "concluido",
    statusAtividade: "Ativa",
    dataInicio: "2026-07-10",
    prazo: "2026-07-15",
    previsaoConclusao: "2026-07-14",
    executoresPorFase: { "em-execucao": ["marcos"], aprovacao: ["marcos"] },
    estimativaPorFase: { "em-execucao": 1, aprovacao: 0.5 },
    participantesIds: [],
    tagIds: [],
    checklist: [],
    comentarios: [],
    historico: [],
  },
  {
    id: "t16",
    titulo: "Banner de renovação antecipada",
    descricao: "Banner incentivando renovação antecipada com desconto progressivo.",
    tipoId: "banner",
    origem: "Projeto",
    projetoId: "70000000-0000-0000-0000-000000000003",
    quantidadeUnidade: 2,
    prioridadeFinal: "Normal",
    faseAtualId: "em-execucao",
    statusAtividade: "Ativa",
    etapaAtualId: "design",
    execucaoEtapaAte: "2026-08-14",
    dataInicio: "2026-08-13",
    prazo: "2026-08-16",
    previsaoConclusao: "2026-08-16",
    executoresPorFase: { "em-execucao": ["marcos"], aprovacao: ["marcos"], refacao: ["marcos"] },
    estimativaPorFase: { "em-execucao": 3, aprovacao: 1, refacao: 1.5 },
    participantesIds: [],
    tagIds: [],
    checklist: [],
    comentarios: [
      {
        id: "cm1",
        autorId: "marcos",
        texto: "Faltou o CTA principal, ajusta e manda de novo pra aprovação.",
        data: "2026-08-10T15:00:00",
      },
    ],
    historico: [
      { id: "h1", data: "2026-08-10T15:00:00", autorId: "marcos", descricao: "Devolvida para ajustes", faseId: "em-execucao" },
    ],
  },
  {
    id: "t17",
    titulo: "Material de campanha do Cap Incentivo",
    descricao: "Material explicando o produto Cap Incentivo para a força comercial.",
    tipoId: "material-campanha",
    origem: "Solicitação",
    solicitanteNome: "Diego de Oliveira Marques da Silva",
    solicitanteEmail: "diego.silva@kevseguros.com.br",
    departamento: "Comercial",
    quantidadeUnidade: 3,
    prioridadeSugerida: "Alta",
    prioridadeFinal: "Alta",
    faseAtualId: "backlog",
    statusAtividade: "Ativa",
    dataInicio: "",
    prazo: "2026-08-28",
    previsaoConclusao: "2026-08-26",
    executoresPorFase: { "em-execucao": ["marcos"] },
    estimativaPorFase: { "em-execucao": 5 },
    participantesIds: [],
    tagIds: [],
    checklist: [],
    comentarios: [],
    historico: [],
  },
  {
    id: "t18",
    titulo: "Reels de prevenção para seguro residencial",
    descricao: "Reels curto com dicas de prevenção de sinistros residenciais.",
    tipoId: "post-social",
    origem: "Solicitação",
    solicitanteNome: "Patrícia Gomes Andrade",
    solicitanteEmail: "patricia.andrade@kevseguros.com.br",
    departamento: "Operações",
    quantidadeUnidade: 1,
    prioridadeSugerida: "Regular",
    prioridadeFinal: "Normal",
    faseAtualId: "backlog",
    statusAtividade: "Ativa",
    dataInicio: "",
    prazo: "2026-09-02",
    previsaoConclusao: "2026-08-30",
    executoresPorFase: { "em-execucao": ["carla"] },
    estimativaPorFase: { "em-execucao": 3 },
    participantesIds: [],
    tagIds: ["seguros-residencial"],
    checklist: [],
    comentarios: [],
    historico: [],
  },
  {
    id: "t19",
    titulo: "Vídeo institucional para LinkedIn",
    descricao: "Vídeo curto apresentando a Kev para publicação no LinkedIn corporativo.",
    tipoId: "video",
    origem: "Solicitação",
    solicitanteNome: "Beatriz Paiva Carvalho",
    solicitanteEmail: "beatriz.carvalho@kevseguros.com.br",
    departamento: "Diretoria Executiva",
    prioridadeSugerida: "Alta",
    prioridadeFinal: "Alta",
    faseAtualId: "em-execucao",
    statusAtividade: "Ativa",
    etapaAtualId: "edicao",
    execucaoEtapaAte: "2026-08-17",
    dataInicio: "2026-08-17",
    prazo: "2026-08-22",
    previsaoConclusao: "2026-08-21",
    executoresPorFase: { "em-execucao": ["marcos"] },
    estimativaPorFase: { "em-execucao": 9 },
    participantesIds: [],
    tagIds: [],
    checklist: [],
    comentarios: [],
    historico: [],
  },
  {
    id: "t20",
    titulo: "Post de aniversário da empresa",
    descricao: "Card comemorativo para o aniversário da Kev Seguros nas redes sociais.",
    tipoId: "post-social",
    origem: "Solicitação",
    solicitanteNome: "Aline Benzecry Souza",
    solicitanteEmail: "aline.souza@kevseguros.com.br",
    departamento: "RH",
    quantidadeUnidade: 1,
    prioridadeSugerida: "Regular",
    prioridadeFinal: "Normal",
    faseAtualId: "em-execucao",
    statusAtividade: "Ativa",
    etapaAtualId: "design",
    execucaoEtapaAte: "2026-08-18",
    dataInicio: "2026-08-18",
    prazo: "2026-08-21",
    previsaoConclusao: "2026-08-20",
    executoresPorFase: { "em-execucao": ["marcos"] },
    estimativaPorFase: { "em-execucao": 7 },
    participantesIds: [],
    tagIds: [],
    checklist: [],
    comentarios: [],
    historico: [],
  },
];

export function tarefaById(id: string): Tarefa | undefined {
  return TAREFAS.find((t) => t.id === id);
}

export function tarefasPorFase(faseId: string): Tarefa[] {
  return TAREFAS.filter((t) => t.faseAtualId === faseId);
}

export function estaEmRisco(tarefa: Tarefa): boolean {
  if (!tarefa.previsaoConclusao || !tarefa.prazo) return false;
  return new Date(tarefa.previsaoConclusao) > new Date(tarefa.prazo);
}

/** Pausada/Arquivada saem da contagem de Workload e Painel de Trabalho, sem sumir do sistema. */
export function tarefaContaNoWorkload(tarefa: Tarefa): boolean {
  return tarefa.statusAtividade !== "Pausada" && tarefa.statusAtividade !== "Arquivada";
}

const PRIORIDADE_ORDEM: Record<Tarefa["prioridadeFinal"], number> = {
  Crítica: 0,
  Alta: 1,
  Normal: 2,
  Baixa: 3,
};

export function ordenarPorPrioridadeEPrazo(tarefas: Tarefa[]): Tarefa[] {
  return [...tarefas].sort((a, b) => {
    const diff = PRIORIDADE_ORDEM[a.prioridadeFinal] - PRIORIDADE_ORDEM[b.prioridadeFinal];
    if (diff !== 0) return diff;
    if (!a.prazo) return 1;
    if (!b.prazo) return -1;
    return a.prazo.localeCompare(b.prazo);
  });
}

export function tarefasExecutadasPor(colaboradorId: string, tarefas: Tarefa[] = TAREFAS): Tarefa[] {
  return tarefas.filter((t) =>
    (t.executoresPorFase[t.faseAtualId] ?? []).includes(colaboradorId)
  );
}

/**
 * Tarefas onde `colaboradorId` é quem deve agir AGORA: a etapa atual do planejamento aplicado,
 * quando existir (fonte de verdade desde que o motor de planejamento passou a existir), ou —
 * pra tarefas sem planejamento (triagem, fluxo simples por fase) — o executor da fase atual.
 * `tarefasExecutadasPor` sozinha fica cega pra qualquer tarefa com planejamento, porque nada
 * grava `executoresPorFase` nesse fluxo — só `planejamento.etapas[].colaboradorId`.
 */
export function tarefasParaExecutarAgora(colaboradorId: string, tarefas: Tarefa[] = TAREFAS): Tarefa[] {
  return tarefas.filter((t) => {
    if (t.planejamento) {
      const atual = t.planejamento.etapas.find((e) => e.ordem === t.planejamento!.etapaAtualOrdem);
      return atual?.colaboradorId === colaboradorId;
    }
    return (t.executoresPorFase[t.faseAtualId] ?? []).includes(colaboradorId);
  });
}

/**
 * Tarefas onde `colaboradorId` está envolvido em qualquer momento — etapa passada, atual ou
 * futura do planejamento, ou executor de qualquer fase no fluxo legado — não só o que precisa
 * agir agora. Base pros contadores de "minhas atividades" do Painel de Trabalho, que somam
 * backlog + em execução + aprovação independente de quem é o executor atual daquela fase.
 */
export function minhasTarefas(colaboradorId: string, tarefas: Tarefa[] = TAREFAS): Tarefa[] {
  return tarefas.filter((t) => {
    if (t.planejamento) {
      return t.planejamento.etapas.some((e) => e.colaboradorId === colaboradorId);
    }
    return Object.values(t.executoresPorFase).some((ids) => ids.includes(colaboradorId));
  });
}

/**
 * Filtra `tarefas` (já esperado ser algo como `tarefasParaExecutarAgora`, ou seja, a etapa atual
 * já pertence ao colaborador) pelas que têm alocação no dia `diaIso` — mesma lógica de
 * `horasAlocadasPorDia` (workload.ts), só que devolvendo as tarefas em vez de somar horas.
 * Usado pelo clique nos dias do Workload do Painel de Trabalho.
 */
export function tarefasComAlocacaoNoDia(tarefas: Tarefa[], diaIso: string): Tarefa[] {
  return tarefas.filter((t) => {
    if (t.planejamento) {
      const atual = t.planejamento.etapas.find((e) => e.ordem === t.planejamento!.etapaAtualOrdem);
      return atual != null && atual.alocacoes.some((a) => a.data === diaIso);
    }
    return t.dataInicio === diaIso;
  });
}

export type EtapaFutura = { tarefa: Tarefa; ordem: number; dataFim: string; esforco: number | undefined };

/**
 * Próxima etapa de `colaboradorId` em cada tarefa cujo planejamento ainda não chegou nela —
 * ordenado pela data mais próxima primeiro. É o "Entrando em breve" do Painel de Trabalho
 * (PRD E3): o que está alocado pra essa pessoa mas ainda não é a etapa atual da tarefa.
 *
 * Uma tarefa nunca aparece aqui se `colaboradorId` já é o executor da etapa atual dela — nesse
 * caso ela já está em `tarefasParaExecutarAgora` (a pessoa já pode agir agora), e repetir a
 * mesma tarefa em "Entrando em breve" (por causa de uma etapa futura, também dela) confundia
 * mais do que ajudava.
 *
 * Sempre UM item por etapa (não um por dia alocado) — é o que a lista, o badge de contagem e a
 * tool buscarAtividadesFuturas do keV esperam. Uma etapa que dura vários dias ainda aparece só
 * aqui como um item só, com o esforço total; quem precisa espalhar por dia (o calendário) faz
 * isso lendo `tarefa.planejamento.etapas[...].alocacoes` diretamente, sem mudar essa lista.
 */
export function atividadesEntrandoEmBreve(colaboradorId: string, tarefas: Tarefa[] = TAREFAS): EtapaFutura[] {
  const resultado: EtapaFutura[] = [];
  for (const t of tarefas) {
    if (!t.planejamento) continue;
    const atual = t.planejamento.etapas.find((e) => e.ordem === t.planejamento!.etapaAtualOrdem);
    if (atual?.colaboradorId === colaboradorId) continue;
    const futuras = t.planejamento.etapas
      .filter((e) => e.ordem > t.planejamento!.etapaAtualOrdem && e.colaboradorId === colaboradorId)
      .sort((a, b) => a.ordem - b.ordem);
    if (futuras.length > 0) {
      const proxima = futuras[0];
      const esforco =
        proxima.alocacoes.length > 0
          ? proxima.alocacoes.reduce((soma, a) => soma + a.horas, 0)
          : undefined;
      resultado.push({ tarefa: t, ordem: proxima.ordem, dataFim: proxima.dataFim, esforco });
    }
  }
  return resultado.sort((a, b) => a.dataFim.localeCompare(b.dataFim));
}

/**
 * TODAS as etapas atual + futuras (uma por etapa, não só a próxima) atribuídas a `colaboradorId`
 * em qualquer tarefa — sem a exclusão de "a tarefa já está em tarefasParaExecutarAgora" que
 * `atividadesEntrandoEmBreve` tem. Essa exclusão faz sentido pra lista (evita repetir a mesma
 * tarefa), mas esconde etapas futuras reais quando a pessoa também é dona da etapa atual da
 * mesma tarefa (ex: ela faz a "Cotação" agora e também vai fazer a "Contratação" depois — a
 * Contratação nunca aparecia em lugar nenhum). Usada só pelo calendário de atividades futuras,
 * que quer mostrar a agenda completa da pessoa, não uma lista sem repetição.
 */
export function todasEtapasDoColaborador(colaboradorId: string, tarefas: Tarefa[] = TAREFAS): EtapaFutura[] {
  const resultado: EtapaFutura[] = [];
  for (const t of tarefas) {
    if (!t.planejamento) continue;
    for (const e of t.planejamento.etapas) {
      if (e.colaboradorId !== colaboradorId) continue;
      if (e.ordem < t.planejamento.etapaAtualOrdem) continue; // já concluída
      const esforco = e.alocacoes.length > 0 ? e.alocacoes.reduce((soma, a) => soma + a.horas, 0) : undefined;
      resultado.push({ tarefa: t, ordem: e.ordem, dataFim: e.dataFim, esforco });
    }
  }
  return resultado.sort((a, b) => a.dataFim.localeCompare(b.dataFim));
}

export function tarefasDoProjeto(projetoId: string): Tarefa[] {
  return TAREFAS.filter((t) => t.projetoId === projetoId);
}

/** Esforço total estimado de uma tarefa (soma de todas as etapas, não só a atual) — usado pra
 * somar "horas estimadas" de um projeto inteiro. Planejamento aplicado é a fonte de verdade
 * (soma as alocações de todas as etapas); tarefas sem planejamento caem pro campo legado. */
export function horasEstimadasTarefa(tarefa: Tarefa): number {
  if (tarefa.planejamento) {
    return tarefa.planejamento.etapas.reduce(
      (soma, etapa) => soma + etapa.alocacoes.reduce((s, a) => s + a.horas, 0),
      0
    );
  }
  return Object.values(tarefa.estimativaPorFase).reduce((soma, h) => soma + (h ?? 0), 0);
}

export function progressoProjeto(projetoId: string): number {
  const tarefas = tarefasDoProjeto(projetoId);
  if (tarefas.length === 0) return 0;
  const concluidas = tarefas.filter((t) => t.faseAtualId === "concluido").length;
  return Math.round((concluidas / tarefas.length) * 100);
}

