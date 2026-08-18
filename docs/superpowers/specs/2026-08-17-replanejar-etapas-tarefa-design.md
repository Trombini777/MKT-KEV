# Replanejar etapas de uma atividade em andamento

## Contexto

Uma tentativa anterior (edição inline de data/horas direto no popover "Sequência da atividade")
foi implementada e revertida a pedido do usuário — a linha expandindo pra baixo desalinhava os
avatares das outras etapas e a experiência ficou "estranha". Essa spec substitui aquela
abordagem: em vez de editar dentro do popover, a edição acontece numa tela dedicada que **já
existe** no sistema.

`PlanejamentoRecomendado` (`src/components/planejamento-recomendado.tsx`, 471 linhas) é a tabela
usada hoje durante a Triagem pra aplicar o primeiro planejamento de uma tarefa (Etapa, Duração
dias, Previsto/horas, Iniciar em, Concluir até, Executor, Disponível — todos editáveis, com
recálculo em cadeia via `calcularPlanejamentoSimples`, `src/lib/scheduling.ts:117-147`). Hoje ela
só é renderizada quando `tarefa.faseAtualId === "triagem"` (`task-detail-sheet.tsx:847`), e se
`tarefa.planejamento` já existe, o mesmo espaço renderiza um resumo só leitura sem tabela
(`planejamento-recomendado.tsx:176-`). Essa spec estende esse componente pra também servir de
**replanejamento** de uma tarefa já em execução.

O motor de cálculo já suporta o que precisamos sem mudanças: `calcularPlanejamentoSimples` aceita
datas "forçadas" por etapa (`iniciosForcados`/`concluirForcados`) — etapas já concluídas entram
como forçadas com seus valores reais, funcionando como âncora fixa da cadeia, e só as etapas
editáveis participam do recálculo quando a pessoa mexe em algum campo.

## Objetivo

Um ícone de lápis no canto superior direito do popover "Sequência da atividade" (tooltip
"Replanejar etapas da atividade") abre `PlanejamentoRecomendado` em modo replanejamento: etapas já
concluídas aparecem só leitura com os dados reais, etapa atual e futuras ficam editáveis (data,
horas, executor) com o mesmo recálculo em cadeia que a tela já tem. Salvar atualiza só as etapas
editadas no banco, preserva o histórico das concluídas, e volta pro detalhe da tarefa.

## Design

### `PlanejamentoRecomendado`: novo modo `modoReplanejamento`

Nova prop opcional `modoReplanejamento?: boolean`. Quando `true` (só faz sentido se
`tarefa.planejamento` existir):

- **Estado inicial** dos `useState` (`executoresPorEtapa`, `horasPorEtapa`, `concluirForcados`)
  passa a ser semeado a partir de `tarefa.planejamento.etapas` reais (colaboradorId, soma de
  `alocacoes[].horas`, `dataFim`) em vez dos padrões do tipo de tarefa (`executorPadraoId`,
  `estimativaHoras`). `concluirForcados` é semeado pra **todas** as etapas (concluídas e não),
  fixando a data real de cada uma até que o usuário edite alguma; isso faz a cadeia de cálculo
  já começar consistente com o que está salvo.
- **Não** cai no branch de resumo só-leitura (`if (tarefa.planejamento) return ...`) — em vez
  disso renderiza a tabela normalmente, mas:
  - Linhas com `ordem < tarefa.planejamento.etapaAtualOrdem` (concluídas): células só texto (nome,
    data, horas, avatar+nome do executor), sem `Input`/`Select`, sem coluna "Disponível".
  - Linhas com `ordem >= etapaAtualOrdem`: editáveis normalmente, herdando o recálculo em cadeia
    que a tabela já tem hoje.
- **Validação de ordem cronológica** (nova): antes de habilitar "Salvar", confere que a sequência
  de `concluirEm` das linhas retornadas por `calcularPlanejamentoSimples` é não-decrescente por
  `ordem`. Se não for, desabilita o botão com uma mensagem inline (mesmo padrão visual de
  `STATUS_INFO`), sem travar a digitação.
- **Salvar** chama `replanejarEtapasDaAtividade` (nova, abaixo) em vez de
  `aplicarPlanejamento`/`moveTask`, e dispara um callback `onSalvar?: () => void` (nova prop) pra
  quem renderizou o componente saber que terminou e fechar a tela.

### Nova função `replanejarEtapasDaAtividade` (`src/lib/task-store.ts`)

```
replanejarEtapasDaAtividade(taskId, etapasEditadas: EtapaAgendada[])
```

Recebe só as etapas `ordem >= etapaAtualOrdem` (as concluídas não são tocadas). Pra cada uma:

1. `UPDATE planejamento_etapas SET colaborador_id, data_fim` por `(planejamento_id, ordem)` —
   nunca deleta/recria a linha (preserva o `id`, que é a chave de dedup do convite proativo do
   keV em `kev_convites_atividade`).
2. `DELETE` + `INSERT` em `planejamento_alocacoes` daquela etapa com o novo total de horas na nova
   data — mesmo padrão já usado em `ajustarEtapaEmExecucao` (linha 936-942). Sem isso, o cálculo
   de carga por dia (`horasAlocadasPorDia`, usado pelo Workload e pela tool `buscarCargaPorDia` do
   keV) ficaria somando horas na pessoa/dia errados.

Depois do loop:

- Recalcula `previsaoConclusao` como o máximo de `dataFim` entre TODAS as etapas (concluídas +
  editadas) e atualiza `tarefas.previsao_conclusao`.
- Se o `colaboradorId` da etapa **atual** (`ordem === etapaAtualOrdem`) mudou, também atualiza
  `tarefas.executores_por_fase[faseAtualId] = [novoColaboradorId]` — mesmo formato de
  `atribuirResponsavelEtapa` (linha 239-254). Sem isso, a tool `buscarCargaEquipe` do keV
  continuaria contando a pessoa antiga na carga do time.
- Insere um evento em `historico_eventos`: `"${autor} replanejou N etapa(s) restante(s) da
  atividade"` — mesmo padrão de `inserirHistorico` usado pelos outros mutators, garantindo que o
  keV veja essa mudança no contexto da tarefa (`buscarContextoTarefaFocada` já lê
  `tarefa.historico`).
- Atualiza o estado em memória (`tasks`) preservando `tempoGastoHoras` de cada etapa (edição de
  data/horas planejadas não apaga tempo já registrado de verdade).

### Corrigir o mesmo gap em `reatribuirExecutorEtapa`

Achado na análise de impacto: `reatribuirExecutorEtapa` (linha 257-308, usada pelo "Trocar
executor" já existente no popover) também só atualiza `planejamento_etapas.colaborador_id`, nunca
`executores_por_fase` — mesma falha que `buscarCargaEquipe` herdaria. Corrigido junto: quando a
etapa reatribuída for a atual (`ordem === t.planejamento.etapaAtualOrdem`), sincroniza
`executoresPorFase[faseAtualId]` também.

### `task-detail-sheet.tsx`: gatilho

- Ícone de lápis (`Pencil`, lucide-react) no cabeçalho do popover "Sequência da atividade", ao
  lado do texto "SEQUÊNCIA DA ATIVIDADE" — só aparece quando `fluxoEmAndamento` (tarefa já tem
  planejamento ativo, faz sentido replanejar). `title="Replanejar etapas da atividade"` (tooltip
  nativo). Independente da fase atual da tarefa — diferente do bloco de Triagem, que só aparece
  em `faseAtualId === "triagem"`.
- Clique fecha o popover de sequência e abre um novo `Dialog` (reaproveitando `Dialog`/
  `DialogContent` já importados no arquivo) com `<PlanejamentoRecomendado tarefa={tarefa}
  modoReplanejamento onSalvar={() => setReplanejando(false)} />` dentro.
- Fechar o dialog sem salvar (X ou clique fora) descarta as edições locais (comportamento padrão
  de Dialog — o componente desmonta, o estado local dele some).

## Fora de escopo

- Mudar `calcularPlanejamentoSimples`/`scheduling.ts` — o suporte a datas forçadas já cobre o
  caso de uso, sem precisar de parâmetro novo.
- Corrigir todo lugar que já lida com `executoresPorFase` de forma legada — só os dois pontos de
  escrita relevantes (`reatribuirExecutorEtapa`, `replanejarEtapasDaAtividade`) são ajustados.
- Notificar a pessoa envolvida quando o replanejamento muda o executor da etapa atual (fica pro
  convite proativo do keV, que já dispara sozinho quando a pessoa nova abre a tarefa).

## Testes

Sem test runner configurado — validação via `tsc --noEmit`, `eslint`, `next build`, mais manual:
abrir uma tarefa com planejamento aplicado e etapas concluídas + pendentes; clicar no lápis no
popover de sequência; confirmar que etapas concluídas aparecem só leitura e atual/futuras
editáveis; editar horas/data/executor de uma etapa futura e confirmar recálculo em cadeia das
seguintes; tentar forçar uma data anterior à etapa anterior e confirmar que o Salvar fica
desabilitado com mensagem; salvar e confirmar que voltou pro detalhe da tarefa, que o Workload
reflete a nova alocação, que `buscarCargaEquipe`/histórico da tarefa refletem a mudança de
executor (se houver), e que abrir a tarefa como a nova pessoa responsável dispara o convite
proativo do keV normalmente.
