# Filtro por dia no Workload do Painel de Trabalho

## Contexto

O widget Workload (`WorkloadView` → `PersonDayGrid`) no Painel de Trabalho mostra, por dia,
quantas horas cada colaborador tem alocadas. `PersonDayGrid` já suporta hover (destaque da coluna
do dia) e clique (`onSelecionarDia`) via props, mas nenhuma tela liga essas props hoje — tanto em
`PainelDeTrabalho` quanto em `VisualizacoesPage`, `WorkloadView` é usado sem
`diaSelecionado`/`onSelecionarDia`.

Também já existe `tarefasComAlocacaoNoDia` (`src/lib/mock/tarefas.ts`), com comentário explícito
de que foi criada para este uso ("Usado pelo clique nos dias do Workload do Painel de Trabalho"),
mas não é chamada em nenhum lugar ainda.

## Objetivo

No Painel de Trabalho, clicar num dia da coluna do Workload filtra "Suas atividades" e
"Atividades futuras" para mostrar só o que tem alocação naquele dia. Clicar de novo no mesmo dia
limpa o filtro.

## Design

**Estado:** `diaSelecionado: string | null` como `useState` em `PainelDeTrabalho` — é o único
componente pai comum entre `WorkloadView`, `TaskExecutionList` e `AtividadesEntrandoEmBreve`.

**Fluxo de seleção:**
- `PainelDeTrabalho` passa `diaSelecionado` e um `onSelecionarDia` para `WorkloadView`, que já
  repassa ambos para `PersonDayGrid` sem alteração (a prop-drilling já existe).
- `onSelecionarDia(iso)`: se `iso === diaSelecionado`, seta `null` (limpa); senão, seta `iso`.
- Hover e destaque de coluna no clique já funcionam via `PersonDayGrid` — nenhuma mudança
  necessária nesse componente.

**Filtragem das listas** (só aplicada quando `diaSelecionado != null`):
- "Suas atividades": `tarefasComAlocacaoNoDia(minhasExecucoes, diaSelecionado)`.
- "Atividades futuras": nova função `etapasFuturasComAlocacaoNoDia(itens: EtapaFutura[], diaIso: string): EtapaFutura[]`
  em `src/lib/mock/tarefas.ts`, ao lado de `tarefasComAlocacaoNoDia` — mantém os itens cuja etapa
  futura (`tarefa.planejamento.etapas` na `ordem` do item) tem alguma `alocacao.data === diaIso`.
  Simétrica a `tarefasComAlocacaoNoDia`, reaproveitando o mesmo padrão de busca da etapa por
  `ordem` já usado em `atividadesEntrandoEmBreve`.

**Indicador de filtro ativo:** quando `diaSelecionado != null`, uma linha acima das duas seções
("Suas atividades" / "Atividades futuras") no formato `Filtrando: DD/MM ✕` (reaproveitar
`formatDataCurta` de `atividades-entrando-em-breve.tsx`, promovendo-a para um local compartilhado
ou duplicando a formatação simples de data). Clicar no `✕` chama o mesmo handler de limpar
(`setDiaSelecionado(null)`).

**Estados vazios:** sem mensagem nova — cada componente já trata lista vazia
(`AtividadesEntrandoEmBreve` mostra "Nada chegando..."; `TaskExecutionList` mostra "Nada na sua
fila agora.").

**Fora de escopo / não muda:**
- Trocar entre 7D/15D/30D não limpa `diaSelecionado` (o estado do intervalo é local ao
  `WorkloadView`, independente do dia selecionado no pai).
- Dias de fim de semana continuam clicáveis normalmente, sem tratamento especial.
- Nenhuma mudança em `VisualizacoesPage` (o Workload ali continua não-interativo, sem
  `diaSelecionado`/`onSelecionarDia`).

## Testes

Projeto não tem test runner configurado (sem `vitest`/`jest` no `package.json`) — validação via
`tsc --noEmit`, `eslint` e `next build` limpos, mais verificação manual no navegador: clicar num
dia com atividades e ver as duas listas filtrarem; clicar de novo e ver tudo voltar; clicar no
`✕` do indicador e confirmar o mesmo efeito; trocar 7D/15D/30D com filtro ativo e confirmar que
ele não é perdido.
