import type {
  Tarefa,
  TipoTarefa,
  EtapaAgendada,
  AlocacaoDia,
  StatusPlanejamento,
  SugestaoTrocaExecutor,
  PrioridadeFinal,
} from "./mock/types";
import { COLABORADORES } from "./mock/colaboradores";
import { horasAlocadasPorDia, capacidadeDiaria } from "./mock/workload";
import { diasEntre } from "./hoje";

/** ordem (EtapaDoTipo) -> colaboradorId escolhido pra executar aquela etapa. */
export type ExecutorPorEtapa = Record<number, string>;

/** `${colaboradorId}:${data}` -> horas extras liberadas pontualmente pra esse dia (não persiste no cadastro). */
export type ExtrasCapacidade = Record<string, number>;

export type ResultadoPlanejamentoBase = {
  etapas: EtapaAgendada[];
  previsaoConclusao: string;
  status: StatusPlanejamento;
  folgaDias?: number;
};

/** Etapa que atrasou o início em relação ao ideal (sem restrição de capacidade) por falta de espaço na agenda. */
export type Gargalo = {
  ordem: number;
  etapaId: string;
  colaboradorId: string;
  inicioIdeal: string;
  inicioReal: string;
  diasAtraso: number;
  /** Quantas horas o executor já tinha ocupadas (de outros compromissos) no dia em que a etapa deveria ter começado. */
  horasOcupadasNoDiaIdeal: number;
  /** Capacidade diária desse executor, pra dar contexto ao número de horas ocupadas. */
  capacidadeDiaExecutor: number;
};

/** Sugestão de mover a ocupação de outra tarefa pra abrir espaço nesse planejamento. */
export type SugestaoReajuste = {
  tarefaId: string;
  tituloTarefa: string;
  colaboradorId: string;
  diaConflito: string;
  motivo: "folga-propria" | "prioridade-menor";
  novaPrevisaoConclusao: string;
};

export type ResultadoPlanejamento = ResultadoPlanejamentoBase & {
  sugestaoTroca?: SugestaoTrocaExecutor;
  gargalos: Gargalo[];
  sugestaoReajuste?: SugestaoReajuste;
  /** Previsão de conclusão da mesma atividade se ninguém mais tivesse nenhum outro compromisso. */
  previsaoSolo: string;
  /** true quando mesmo sem disputa de agenda com outras tarefas, a cadeia de etapas já não caberia no prazo. */
  atrasoEstrutural: boolean;
};

const RANK_PRIORIDADE: Record<PrioridadeFinal, number> = {
  Crítica: 4,
  Alta: 3,
  Normal: 2,
  Baixa: 1,
};

const HORIZONTE_MAX_DIAS = 120;

export function proximoDia(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + 1));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

function ehFimDeSemana(iso: string): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  const dia = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return dia === 0 || dia === 6;
}

export function proximoDiaUtil(iso: string): string {
  let dia = iso;
  while (ehFimDeSemana(dia)) dia = proximoDia(dia);
  return dia;
}

/** Classifica o status de prazo de um planejamento a partir da previsão de conclusão. */
export function classificarStatus(
  previsaoConclusao: string,
  prazo?: string
): { status: StatusPlanejamento; folgaDias?: number } {
  if (!prazo) return { status: "sem-prazo" };
  const folgaDias = diasEntre(previsaoConclusao, prazo);
  if (folgaDias < 0) return { status: "impossivel", folgaDias };
  if (folgaDias < 1) return { status: "apertado", folgaDias };
  return { status: "dentro-do-prazo", folgaDias };
}

/** Uma linha da tabela de planejamento simples: datas calculadas por soma direta de dias, sem checar capacidade. */
export type LinhaPlanejamentoSimples = {
  ordem: number;
  etapaId: string;
  colaboradorId: string;
  duracaoDias: number;
  horas: number;
  inicioEm: string;
  concluirEm: string;
};

/**
 * Cálculo direto de datas por etapa (sem motor de regras): cada etapa começa onde a anterior
 * terminou e dura `duracaoDias` dias úteis — sem checar capacidade, gargalo ou sugerir nada.
 * É a versão "manual" enquanto o motor de regras completo (`gerarPlanejamento`) fica reservado
 * pra quando a automação mais esperta voltar a ser usada nessa tela.
 */
export function calcularPlanejamentoSimples(
  tipo: TipoTarefa,
  executoresPorEtapa: ExecutorPorEtapa,
  duracoesPorEtapa: Record<number, number>,
  horasPorEtapa: Record<number, number>,
  dataInicio: string,
  iniciosForcados: Record<number, string> = {},
  concluirForcados: Record<number, string> = {}
): LinhaPlanejamentoSimples[] {
  const etapasOrdenadas = [...tipo.etapas].sort((a, b) => a.ordem - b.ordem);
  const linhas: LinhaPlanejamentoSimples[] = [];
  let cursor = proximoDiaUtil(dataInicio);

  for (const etapa of etapasOrdenadas) {
    const colaboradorId = executoresPorEtapa[etapa.ordem] ?? etapa.executorPadraoId ?? "";
    const duracaoDias = duracoesPorEtapa[etapa.ordem] ?? etapa.slaDias ?? 0;
    const horas = horasPorEtapa[etapa.ordem] ?? etapa.estimativaHoras ?? 0;
    // "Iniciar em"/"Concluir até" podem ser editados na mão, direto na tabela — quando isso
    // acontece, essa data vale independente do que a duração/cadeia calcularia sozinha.
    const inicioEm = iniciosForcados[etapa.ordem] ?? cursor;
    let concluirEm = concluirForcados[etapa.ordem];
    if (!concluirEm) {
      concluirEm = inicioEm;
      for (let i = 0; i < duracaoDias; i++) concluirEm = proximoDiaUtil(proximoDia(concluirEm));
    }
    linhas.push({ ordem: etapa.ordem, etapaId: etapa.etapaId, colaboradorId, duracaoDias, horas, inicioEm, concluirEm });
    cursor = concluirEm;
  }

  return linhas;
}

function gerarPlanejamentoBase(
  tipo: TipoTarefa,
  executoresPorEtapa: ExecutorPorEtapa,
  dataInicio: string,
  prazo: string | undefined,
  tarefas: Tarefa[],
  extrasCapacidade: ExtrasCapacidade = {},
  datasForcadas: Record<number, string> = {}
): ResultadoPlanejamentoBase {
  const etapasOrdenadas = [...tipo.etapas].sort((a, b) => a.ordem - b.ordem);
  const cargaSimulada = new Map<string, number>(); // `${colaboradorId}:${data}` -> horas já reservadas nesta geração
  const fimPorOrdem = new Map<number, string>();
  const etapas: EtapaAgendada[] = [];

  for (const etapa of etapasOrdenadas) {
    const colaboradorId = executoresPorEtapa[etapa.ordem] ?? etapa.executorPadraoId;
    if (!colaboradorId) continue; // sem responsável definido — não dá pra agendar essa etapa

    const capacidadeDoDia = (dia: string) =>
      capacidadeDiaria(colaboradorId) + (extrasCapacidade[`${colaboradorId}:${dia}`] ?? 0);

    // A etapa pode começar no MESMO dia em que a dependência termina (modelo por dia inteiro,
    // sem hora do dia) — só empurra pro próximo dia útil se cair num fim de semana.
    let inicioMinimo = dataInicio;
    for (const dep of etapa.dependeDe ?? []) {
      const fimDep = fimPorOrdem.get(dep);
      if (fimDep && fimDep > inicioMinimo) inicioMinimo = fimDep;
    }
    inicioMinimo = proximoDiaUtil(inicioMinimo);

    // Edição manual: força a etapa pro dia escolhido (nunca antes do que a dependência
    // permite), colocando todas as horas nesse único dia mesmo que estoure a capacidade do
    // executor — é uma decisão consciente de quem está editando, não um erro do motor.
    const dataForcada = datasForcadas[etapa.ordem];
    if (dataForcada) {
      const inicioReal = proximoDiaUtil(dataForcada > inicioMinimo ? dataForcada : inicioMinimo);
      const horas = etapa.estimativaHoras ?? 0;
      const alocacoes: AlocacaoDia[] = [{ data: inicioReal, horas }];
      cargaSimulada.set(
        `${colaboradorId}:${inicioReal}`,
        (cargaSimulada.get(`${colaboradorId}:${inicioReal}`) ?? 0) + horas
      );
      fimPorOrdem.set(etapa.ordem, inicioReal);
      etapas.push({ etapaId: etapa.etapaId, ordem: etapa.ordem, colaboradorId, alocacoes, dataFim: inicioReal });
      continue;
    }

    // SLA médio em dias: distribui as horas igualmente por esse tanto de dias úteis
    // consecutivos, em vez de concentrar o quanto antes — modela etapas cujo tempo real é
    // de espera (ex.: aprovação do cliente leva pouco trabalho mas alguns dias até voltar),
    // e passa a governar o prazo final dessa etapa no lugar de `podeDividir`.
    if (etapa.slaDias && etapa.slaDias >= 1) {
      const horasPorDia = Math.round(((etapa.estimativaHoras ?? 0) / etapa.slaDias) * 100) / 100;
      let inicioCandidato = inicioMinimo;
      let diasEscolhidos: string[] = [];
      for (let tentativa = 0; tentativa < HORIZONTE_MAX_DIAS; tentativa++) {
        const dias: string[] = [];
        let cursor = inicioCandidato;
        let cabeTodoMundo = true;
        while (dias.length < etapa.slaDias) {
          if (ehFimDeSemana(cursor)) {
            cursor = proximoDia(cursor);
            continue;
          }
          const ocupado =
            horasAlocadasPorDia(colaboradorId, cursor, {}, tarefas) +
            (cargaSimulada.get(`${colaboradorId}:${cursor}`) ?? 0);
          if (capacidadeDoDia(cursor) - ocupado < horasPorDia) {
            cabeTodoMundo = false;
            break;
          }
          dias.push(cursor);
          cursor = proximoDia(cursor);
        }
        if (cabeTodoMundo) {
          diasEscolhidos = dias;
          break;
        }
        inicioCandidato = proximoDiaUtil(proximoDia(inicioCandidato));
      }
      if (diasEscolhidos.length === 0) diasEscolhidos = [inicioMinimo];

      const alocacoesSla: AlocacaoDia[] = diasEscolhidos.map((data) => ({ data, horas: horasPorDia }));
      for (const data of diasEscolhidos) {
        cargaSimulada.set(
          `${colaboradorId}:${data}`,
          (cargaSimulada.get(`${colaboradorId}:${data}`) ?? 0) + horasPorDia
        );
      }
      const dataFimSla = diasEscolhidos[diasEscolhidos.length - 1];
      fimPorOrdem.set(etapa.ordem, dataFimSla);
      etapas.push({
        etapaId: etapa.etapaId,
        ordem: etapa.ordem,
        colaboradorId,
        alocacoes: alocacoesSla,
        dataFim: dataFimSla,
      });
      continue;
    }

    let horasRestantes = etapa.estimativaHoras ?? 0;
    const alocacoes: AlocacaoDia[] = [];

    if (!etapa.podeDividir && horasRestantes > capacidadeDoDia(inicioMinimo)) {
      // Etapa maior que a capacidade padrão do executor e não pode ser dividida — procura algum dia
      // no horizonte com capacidade suficiente (ex.: um dia com extensão pontual de horário aplicada).
      let diaComEspaco: string | null = null;
      let candidato = inicioMinimo;
      for (let i = 0; i < HORIZONTE_MAX_DIAS; i++) {
        if (!ehFimDeSemana(candidato) && capacidadeDoDia(candidato) >= horasRestantes) {
          diaComEspaco = candidato;
          break;
        }
        candidato = proximoDia(candidato);
      }
      const diaFinal = diaComEspaco ?? inicioMinimo;
      alocacoes.push({ data: diaFinal, horas: horasRestantes });
      fimPorOrdem.set(etapa.ordem, diaFinal);
      etapas.push({ etapaId: etapa.etapaId, ordem: etapa.ordem, colaboradorId, alocacoes, dataFim: diaFinal });
      continue;
    }

    if (horasRestantes === 0) {
      alocacoes.push({ data: inicioMinimo, horas: 0 });
    }

    let dia = inicioMinimo;
    let tentativas = 0;
    while (horasRestantes > 0 && tentativas < HORIZONTE_MAX_DIAS) {
      tentativas++;
      if (ehFimDeSemana(dia)) {
        dia = proximoDia(dia);
        continue;
      }
      const ocupado =
        horasAlocadasPorDia(colaboradorId, dia, {}, tarefas) + (cargaSimulada.get(`${colaboradorId}:${dia}`) ?? 0);
      const livre = capacidadeDoDia(dia) - ocupado;
      if (livre <= 0) {
        dia = proximoDia(dia);
        continue;
      }
      if (etapa.podeDividir) {
        const usar = Math.min(livre, horasRestantes);
        alocacoes.push({ data: dia, horas: usar });
        cargaSimulada.set(`${colaboradorId}:${dia}`, ocupado + usar);
        horasRestantes -= usar;
        dia = proximoDia(dia);
      } else if (livre >= horasRestantes) {
        alocacoes.push({ data: dia, horas: horasRestantes });
        cargaSimulada.set(`${colaboradorId}:${dia}`, ocupado + horasRestantes);
        horasRestantes = 0;
      } else {
        dia = proximoDia(dia);
      }
    }

    const dataFim = alocacoes.length > 0 ? alocacoes[alocacoes.length - 1].data : inicioMinimo;
    fimPorOrdem.set(etapa.ordem, dataFim);
    etapas.push({ etapaId: etapa.etapaId, ordem: etapa.ordem, colaboradorId, alocacoes, dataFim });
  }

  const previsaoConclusao = etapas.reduce((max, e) => (e.dataFim > max ? e.dataFim : max), dataInicio);
  const { status, folgaDias } = classificarStatus(previsaoConclusao, prazo);
  return { etapas, previsaoConclusao, status, folgaDias };
}

function buscarMelhorTroca(
  tipo: TipoTarefa,
  executoresPorEtapa: ExecutorPorEtapa,
  dataInicio: string,
  prazo: string | undefined,
  tarefas: Tarefa[],
  baseline: ResultadoPlanejamentoBase,
  datasForcadas: Record<number, string> = {}
): SugestaoTrocaExecutor | undefined {
  let melhor: SugestaoTrocaExecutor | undefined;
  let melhorConclusao = baseline.previsaoConclusao;

  for (const etapa of tipo.etapas) {
    const permitidos = etapa.executoresPermitidosIds ?? [];
    if (permitidos.length === 0) continue;
    const atualId = executoresPorEtapa[etapa.ordem] ?? etapa.executorPadraoId;

    for (const candidatoId of permitidos) {
      if (candidatoId === atualId) continue;
      const colaborador = COLABORADORES.find((c) => c.id === candidatoId);
      if (!colaborador || colaborador.status !== "Ativo") continue;

      const executoresAlternativos = { ...executoresPorEtapa, [etapa.ordem]: candidatoId };
      const resultado = gerarPlanejamentoBase(
        tipo,
        executoresAlternativos,
        dataInicio,
        prazo,
        tarefas,
        {},
        datasForcadas
      );
      if (resultado.previsaoConclusao < melhorConclusao) {
        melhorConclusao = resultado.previsaoConclusao;
        melhor = {
          etapaOrdem: etapa.ordem,
          executorAtualId: atualId ?? "",
          executorSugeridoId: candidatoId,
          novaPrevisaoConclusao: resultado.previsaoConclusao,
          novaFolgaDias: resultado.folgaDias,
        };
      }
    }
  }

  return melhor;
}

/**
 * Pra cada etapa, a data em que ela poderia ter começado considerando só a cadeia de
 * dependências REAL (quando a etapa anterior realmente terminou nesse planejamento) — sem
 * nenhuma restrição de capacidade do próprio executor. É a baseline certa pra saber se ESSA
 * etapa específica somou atraso próprio, e não só herdou o atraso de quem vem antes dela.
 */
function calcularInicioMinimoPorOrdem(
  tipo: TipoTarefa,
  dataInicio: string,
  resultadoReal: ResultadoPlanejamentoBase
): Map<number, string> {
  const inicioPorOrdem = new Map<number, string>();
  const etapasOrdenadas = [...tipo.etapas].sort((a, b) => a.ordem - b.ordem);

  for (const etapa of etapasOrdenadas) {
    let inicioMinimo = dataInicio;
    for (const dep of etapa.dependeDe ?? []) {
      const etapaDep = resultadoReal.etapas.find((e) => e.ordem === dep);
      if (etapaDep && etapaDep.dataFim > inicioMinimo) inicioMinimo = etapaDep.dataFim;
    }
    inicioPorOrdem.set(etapa.ordem, proximoDiaUtil(inicioMinimo));
  }

  return inicioPorOrdem;
}

/**
 * Etapas cujo início real ficou atrasado em relação ao quanto antes elas PODERIAM ter começado
 * dado o fim real de suas dependências — ou seja, o próprio executor daquela etapa não tinha
 * espaço na agenda quando a etapa ficou pronta pra começar. Isso isola o atraso causado pela
 * agenda de CADA executor, e não simplesmente propaga o mesmo "gargalo" pra toda etapa
 * downstream que só está esperando a anterior terminar (essa espera não é culpa dela).
 */
export function identificarGargalos(
  tipo: TipoTarefa,
  dataInicio: string,
  resultadoReal: ResultadoPlanejamentoBase,
  tarefas: Tarefa[]
): Gargalo[] {
  const gargalos: Gargalo[] = [];
  const inicioMinimoPorOrdem = calcularInicioMinimoPorOrdem(tipo, dataInicio, resultadoReal);

  for (const etapaReal of resultadoReal.etapas) {
    const inicioIdeal = inicioMinimoPorOrdem.get(etapaReal.ordem);
    const inicioReal = etapaReal.alocacoes[0]?.data;
    if (inicioIdeal && inicioReal && inicioReal > inicioIdeal) {
      gargalos.push({
        ordem: etapaReal.ordem,
        etapaId: etapaReal.etapaId,
        colaboradorId: etapaReal.colaboradorId,
        horasOcupadasNoDiaIdeal: horasAlocadasPorDia(etapaReal.colaboradorId, inicioIdeal, {}, tarefas),
        capacidadeDiaExecutor: capacidadeDiaria(etapaReal.colaboradorId),
        inicioIdeal,
        inicioReal,
        diasAtraso: diasEntre(inicioIdeal, inicioReal),
      });
    }
  }

  return gargalos;
}

/** Quantas horas outra tarefa já ocupa de um colaborador num dia específico (mesma lógica de horasAlocadasPorDia). */
function ocupacaoDeOutraTarefaNoDia(outra: Tarefa, colaboradorId: string, dia: string): number {
  if (outra.planejamento) {
    let total = 0;
    for (const etapa of outra.planejamento.etapas) {
      if (etapa.colaboradorId !== colaboradorId) continue;
      for (const alocacao of etapa.alocacoes) {
        if (alocacao.data === dia) total += alocacao.horas;
      }
    }
    return total;
  }
  const executores = outra.executoresPorFase[outra.faseAtualId] ?? [];
  if (!executores.includes(colaboradorId)) return 0;
  if (outra.dataInicio !== dia) return 0;
  return outra.estimativaPorFase[outra.faseAtualId] ?? 0;
}

/**
 * Busca uma tarefa cuja ocupação num dia de conflito possa ser deslocada pra abrir espaço:
 * primeiro tenta algo com folga própria (não atrasa o prazo dela), senão algo de prioridade menor.
 */
function buscarSugestaoReajuste(
  tipo: TipoTarefa,
  executoresPorEtapa: ExecutorPorEtapa,
  dataInicio: string,
  prazo: string | undefined,
  tarefas: Tarefa[],
  tarefaAtual: Tarefa,
  gargalos: Gargalo[],
  datasForcadas: Record<number, string> = {}
): SugestaoReajuste | undefined {
  if (gargalos.length === 0) return undefined;

  let candidatoFolga: { outra: Tarefa; colaboradorId: string; dia: string } | undefined;
  let candidatoPrioridade: { outra: Tarefa; colaboradorId: string; dia: string } | undefined;

  for (const gargalo of gargalos) {
    for (const outra of tarefas) {
      if (outra.id === tarefaAtual.id || outra.faseAtualId === "concluido") continue;
      const horas = ocupacaoDeOutraTarefaNoDia(outra, gargalo.colaboradorId, gargalo.inicioReal);
      if (horas <= 0) continue;

      if (!outra.prazo) {
        candidatoFolga ??= { outra, colaboradorId: gargalo.colaboradorId, dia: gargalo.inicioReal };
        continue;
      }
      const previsaoOutra = outra.planejamento?.previsaoConclusao || outra.previsaoConclusao;
      const folgaPropria = previsaoOutra ? diasEntre(previsaoOutra, outra.prazo) : 0;
      if (folgaPropria > 0) {
        candidatoFolga ??= { outra, colaboradorId: gargalo.colaboradorId, dia: gargalo.inicioReal };
        continue;
      }
      if (RANK_PRIORIDADE[outra.prioridadeFinal] < RANK_PRIORIDADE[tarefaAtual.prioridadeFinal]) {
        candidatoPrioridade ??= { outra, colaboradorId: gargalo.colaboradorId, dia: gargalo.inicioReal };
      }
    }
  }

  const escolhido = candidatoFolga ?? candidatoPrioridade;
  if (!escolhido) return undefined;

  // Simula deslocar a ocupação daquele dia pra um dia útil seguinte e recalcula esse planejamento.
  const tarefasSimuladas = tarefas.map((t) => {
    if (t.id !== escolhido.outra.id) return t;
    const novoDia = proximoDiaUtil(proximoDia(escolhido.dia));
    if (t.planejamento) {
      return {
        ...t,
        planejamento: {
          ...t.planejamento,
          etapas: t.planejamento.etapas.map((e) =>
            e.colaboradorId !== escolhido.colaboradorId
              ? e
              : {
                  ...e,
                  alocacoes: e.alocacoes.map((a) =>
                    a.data === escolhido.dia ? { ...a, data: novoDia } : a
                  ),
                }
          ),
        },
      };
    }
    return { ...t, dataInicio: novoDia };
  });

  const resultado = gerarPlanejamentoBase(
    tipo,
    executoresPorEtapa,
    dataInicio,
    prazo,
    tarefasSimuladas,
    {},
    datasForcadas
  );

  return {
    tarefaId: escolhido.outra.id,
    tituloTarefa: escolhido.outra.titulo,
    colaboradorId: escolhido.colaboradorId,
    diaConflito: escolhido.dia,
    motivo: candidatoFolga ? "folga-propria" : "prioridade-menor",
    novaPrevisaoConclusao: resultado.previsaoConclusao,
  };
}

/**
 * Motor de planejamento por regras (sem IA): distribui as etapas de um Tipo de Tarefa
 * respeitando dependências, capacidade diária de cada executor e o prazo final da tarefa.
 * Quando o resultado não fica dentro do prazo, busca a melhor troca de executor entre os
 * `executoresPermitidosIds` de cada etapa — só sugere, nunca aplica sozinho.
 */
export function gerarPlanejamento(args: {
  tipo: TipoTarefa;
  executoresPorEtapa: ExecutorPorEtapa;
  dataInicio: string;
  prazo?: string;
  tarefas: Tarefa[];
  tarefaAtual: Tarefa;
  extrasCapacidade?: ExtrasCapacidade;
  datasForcadas?: Record<number, string>;
}): ResultadoPlanejamento {
  const { tipo, executoresPorEtapa, dataInicio, prazo, tarefas, tarefaAtual, extrasCapacidade, datasForcadas } = args;
  const base = gerarPlanejamentoBase(tipo, executoresPorEtapa, dataInicio, prazo, tarefas, extrasCapacidade, datasForcadas);

  // Roda a mesma atividade "sozinha" (sem nenhuma outra tarefa disputando a agenda) pra isolar
  // o que é atraso causado por outros compromissos das pessoas do que é a duração própria da cadeia.
  const solo = gerarPlanejamentoBase(tipo, executoresPorEtapa, dataInicio, prazo, [], extrasCapacidade, datasForcadas);
  const gargalos = identificarGargalos(tipo, dataInicio, base, tarefas);
  const atrasoEstrutural = solo.status === "impossivel" || solo.status === "apertado";

  if (base.status === "sem-prazo" || base.status === "dentro-do-prazo") {
    return { ...base, gargalos, previsaoSolo: solo.previsaoConclusao, atrasoEstrutural };
  }

  const sugestaoTroca = buscarMelhorTroca(
    tipo,
    executoresPorEtapa,
    dataInicio,
    prazo,
    tarefas,
    base,
    datasForcadas
  );
  const sugestaoReajuste = buscarSugestaoReajuste(
    tipo,
    executoresPorEtapa,
    dataInicio,
    prazo,
    tarefas,
    tarefaAtual,
    gargalos,
    datasForcadas
  );
  return {
    ...base,
    gargalos,
    sugestaoTroca,
    sugestaoReajuste,
    previsaoSolo: solo.previsaoConclusao,
    atrasoEstrutural,
  };
}
