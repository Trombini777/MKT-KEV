import type { Departamento } from "../departamentos";

export type StatusColaborador = "Ativo" | "Em Licença" | "Inativo";

export type Colaborador = {
  id: string;
  nome: string;
  email: string;
  whatsapp?: string;
  /** Data de nascimento (ISO, AAAA-MM-DD) — usada para identificar aniversários. */
  dataNascimento?: string;
  cargo: string;
  skills: string[];
  capacidadeHorasSemana: number;
  status: StatusColaborador;
  squadId: string;
  avatarIniciais: string;
  avatarUrl?: string;
};

export type Squad = {
  id: string;
  nome: string;
};

export type ModoExecucao = "Individual" | "Coletiva";

export type Fase = {
  id: string;
  nome: string;
  ordem: number;
  slaDias: number;
  isFinal: boolean;
  modoExecucao: ModoExecucao;
};

export type Transicao = {
  de: string;
  para: string;
  label?: string;
};

export type CategoriaEtapa = "A fazer" | "Em andamento" | "Concluído";

/** Etapa cadastrada globalmente (aba Etapas), reutilizável por qualquer Tipo de Tarefa. */
export type EtapaTarefa = {
  id: string;
  nome: string;
  categoria: CategoriaEtapa;
};

/** Uso de uma etapa dentro do fluxo de um Tipo de Tarefa específico. */
export type EtapaDoTipo = {
  etapaId: string;
  ordem: number;
  estimativaHoras?: number;
  /** Executor padrão dessa etapa para esse tipo — editável ao criar a tarefa. */
  executorPadraoId?: string;
  /** `ordem` de outras etapas do mesmo tipo que precisam terminar antes desta poder começar. */
  dependeDe?: number[];
  /** Se a carga horária pode ser repartida em vários dias. Sem isso, exige um único dia livre. */
  podeDividir?: boolean;
  /** Colaboradores alternativos aptos a executar essa etapa — usado só na sugestão automática de troca. */
  executoresPermitidosIds?: string[];
  /**
   * Quantidade média de dias corridos até a etapa ser entregue, independente de quantas horas
   * de trabalho ela exige (ex.: aprovação do cliente leva pouco trabalho mas alguns dias de
   * espera). Quando definido, o motor de planejamento distribui `estimativaHoras` igualmente
   * por esses dias úteis em vez de concentrar o quanto antes — e isso passa a governar o prazo
   * final, substituindo `podeDividir` pra essa etapa.
   */
  slaDias?: number;
};

/** Unidade cadastrada globalmente (ex.: Slide, Página, Arte), reutilizável por qualquer Tipo de Tarefa. */
export type UnidadeMedida = {
  id: string;
  nome: string;
};

export type TipoTarefa = {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  /** Como essa atividade é contada (ex.: Slides, Páginas) — usado para informar quantidade ao criar a tarefa. */
  unidadeMedidaId?: string;
  etapas: EtapaDoTipo[];
  /** Data (ISO, AAAA-MM-DD) da última alteração no nome, descrição, unidade ou fluxo. */
  atualizadoEm: string;
};

export type PrioridadeSugerida = "Alta" | "Regular" | "Baixa";
export type PrioridadeFinal = "Crítica" | "Alta" | "Normal" | "Baixa";
export type Origem = "Projeto" | "Solicitação";

export type Tag = {
  id: string;
  nome: string;
};

export type ChecklistItem = {
  id: string;
  texto: string;
  feito: boolean;
};

export type Comentario = {
  id: string;
  autorId: string;
  texto: string;
  data: string;
};

export type HistoricoEvento = {
  id: string;
  data: string;
  autorId: string;
  descricao: string;
  /** Fase que a tarefa passou a ocupar nesse evento — usado pro bloco colorido no histórico. */
  faseId?: string;
  /** Decisão de aprovação interna registrada nesse evento, quando aplicável. */
  acao?: "aprovada" | "recusada";
};

export type ExecutorPorFase = Record<string, string[]>; // faseId -> colaboradorId[]
export type EstimativaPorFase = Record<string, number>; // faseId -> horas

export type TipoSolicitacaoGeral = "Tarefa" | "Projeto" | "Campanha";

/** Uma fração de horas de uma etapa agendada num dia específico. */
export type AlocacaoDia = {
  data: string; // ISO, AAAA-MM-DD
  horas: number;
};

/** Etapa de um planejamento gerado: quem vai executar e em quais dias. */
export type EtapaAgendada = {
  etapaId: string;
  /** `ordem` da EtapaDoTipo de origem. */
  ordem: number;
  colaboradorId: string;
  alocacoes: AlocacaoDia[];
  /** Última data em `alocacoes` — quando a etapa termina. */
  dataFim: string;
};

export type StatusPlanejamento = "sem-prazo" | "dentro-do-prazo" | "apertado" | "impossivel";

/** Sugestão (informativa, nunca aplicada sozinha) de trocar o executor de uma etapa. */
export type SugestaoTrocaExecutor = {
  etapaOrdem: number;
  executorAtualId: string;
  executorSugeridoId: string;
  novaPrevisaoConclusao: string;
  novaFolgaDias?: number;
};

/** Planejamento por etapa gerado pelo motor de regras e aplicado a uma Tarefa. */
export type PlanejamentoTarefa = {
  /** Data (ISO) em que este planejamento foi gerado/aplicado. */
  geradoEm: string;
  etapas: EtapaAgendada[];
  previsaoConclusao: string;
  status: StatusPlanejamento;
  /** Dias entre previsaoConclusao e prazo (prazo − previsão). Negativo = atraso. Undefined = sem prazo. */
  folgaDias?: number;
};

export type Tarefa = {
  id: string;
  titulo: string;
  descricao: string;
  /** Sem tipo até a triagem classificar — cards de solicitação chegam sem isso definido. */
  tipoId?: string;
  origem: Origem;
  /** Nome de quem pediu a tarefa — preenchido quando origem é "Solicitação". */
  solicitanteNome?: string;
  /** E-mail de quem pediu a tarefa — preenchido quando origem é "Solicitação". */
  solicitanteEmail?: string;
  /** Nomes dos arquivos anexados na solicitação — preenchido quando origem é "Solicitação". */
  anexos?: string[];
  /** Por que a solicitação é Alta prioridade — preenchido só quando prioridadeSugerida é "Alta". */
  justificativaPrioridade?: string;
  /** Por que o prazo informado é necessário — preenchido só quando o solicitante indicou prazo limite. */
  justificativaPrazo?: string;
  /** Observações adicionais livres deixadas por quem pediu a tarefa. */
  observacoes?: string;
  /** Quantidade na unidade de medida do tipo (ex.: 3 Artes) — só relevante quando o tipo tem unidadeMedidaId. */
  quantidadeUnidade?: number;
  /** Resposta da triagem: "Temos todos os dados necessários para a execução da atividade?" */
  dadosCompletos?: "sim" | "nao";
  /** Resposta da triagem: classificação geral da solicitação (Tarefa/Projeto/Campanha). */
  tipoSolicitacaoGeral?: TipoSolicitacaoGeral;
  departamento?: string;
  projetoId?: string;
  prioridadeSugerida?: PrioridadeSugerida;
  prioridadeFinal: PrioridadeFinal;
  faseAtualId: string;
  etapaAtualId?: string;
  execucaoEtapaAte?: string;
  dataInicio: string;
  prazo: string;
  previsaoConclusao: string;
  executoresPorFase: ExecutorPorFase;
  estimativaPorFase: EstimativaPorFase;
  participantesIds: string[];
  tagIds: string[];
  checklist: ChecklistItem[];
  comentarios: Comentario[];
  historico: HistoricoEvento[];
  /** Planejamento por etapa gerado pelo motor de regras e aplicado pelo usuário. */
  planejamento?: PlanejamentoTarefa;
};

export type Projeto = {
  id: string;
  nome: string;
  sigla: string;
  descricao: string;
  tipo: "Projeto" | "Campanha";
  departamento: Departamento;
  responsavelId: string;
  dataInicio: string;
  dataFim: string;
  notasEncerramento?: string;
};

export type ExecutorPadrao = Record<string, string>; // `${tipoId}:${faseId}` -> colaboradorId

export type PerfilUsuario = "Admin" | "Editor" | "Viewer";

export type Usuario = {
  id: string;
  colaboradorId: string;
  perfil: PerfilUsuario;
};
