# Calendário de mês para "Atividades futuras"

## Contexto

"Atividades futuras" (`src/components/atividades-entrando-em-breve.tsx`) hoje é uma lista linear
das próximas etapas do usuário (`atividadesEntrandoEmBreve`, ordenada por `dataFim`). O usuário
quer uma visão de calendário de mês pra enxergar, por dia, quantas atividades futuras têm e quais
são — sem precisar rolar uma lista.

O sistema já tem uma grade de mês (`CalendarioEditorial`, em
`src/components/calendario-editorial.tsx`) usada na aba "Calendário" de Visualizações, agrupando
tarefas de todo o time pelo `prazo` final. A lógica de gerar a grade (padding de semana, offset do
primeiro dia) será extraída pra reuso, e não modificamos o `CalendarioEditorial` além do reuso.

## Decisões (via brainstorming)

- Substitui **só** "Atividades futuras" — "Suas atividades" continua lista, sem mudança.
- Formato: grade de mês (padrão visual do `CalendarioEditorial`), com navegação de mês (‹ ›).
- Conteúdo de cada dia: itens **individuais** e clicáveis (não mesclar em contagem por tipo/etapa)
  — rótulo `{etapa.nome}: {tarefa.titulo}`, truncando com "+N" além do 3º item, igual ao padrão já
  usado no `CalendarioEditorial`.
- Um número pequeno ao lado da data mostra o total de itens daquele dia (visível mesmo com "+N").
- Clique num dia do Workload (`diaSelecionado`) navega o calendário pro mês daquele dia e desenha
  um anel de destaque na célula — não esconde os outros dias (o calendário já organiza tudo por
  dia, diferente da lista antiga).

## Design técnico

**`src/lib/hoje.ts`** — duas funções novas, reaproveitando o padrão local-safe já usado ali:
- `dataParaIso(d: Date): string` — canoniza a conversão Date → "YYYY-MM-DD" sem passar por UTC
  (`toIso` de `calendario-editorial.tsx` usa `.toISOString()`, que erra o dia perto da virada de
  fuso; `toIso` de `workload.ts` já faz certo — este vira a versão compartilhada).
- `gerarGradeMes(ano: number, mes: number): (Date | null)[]` — extraído do `CalendarioEditorial`
  (offset do primeiro dia da semana + padding até completar semanas de 7).

**`src/components/calendario-editorial.tsx`** — troca o `toIso`/geração de células locais pelas
funções de `hoje.ts`. Sem mudança visual ou de comportamento.

**`src/components/atividades-entrando-em-breve.tsx`** — reescrito:
- Prop nova: `diaSelecionado?: string | null` (recebida do Painel de Trabalho).
- Estado interno `mesExibido: Date` (mês atualmente visível), default mês corrente.
- `useEffect`: quando `diaSelecionado` muda pra um valor não-nulo, atualiza `mesExibido` pro mês
  daquele dia.
- Agrupa todos os itens de `itens: EtapaFutura[]` num `Map<iso, EtapaFutura[]>` por `dataFim`
  (sem limitar por mês — só o lookup por célula é que filtra pelo mês exibido).
- Cada célula: número do dia + contagem total (se > 0) + até 3 `TaskLink` (rótulo
  `{minhaEtapa.nome}: {tarefa.titulo}`, com `title` mostrando o texto completo + esforço) + "+N".
- Célula do dia em `diaSelecionado` recebe anel de destaque (mesmo padrão visual do
  `PersonDayGrid`: `ring-2 ring-primary ring-offset-1`).
- Cabeçalho fixo "Atividades futuras" (h2) continua sempre visível, sem mensagem de "vazio" — uma
  grade de mês com células em branco já comunica isso sozinha.

**`src/components/painel-de-trabalho.tsx`** — passa `diaSelecionado={diaSelecionado}` pro
`AtividadesEntrandoEmBreve`.

## Fora de escopo

- `CalendarioEditorial` não ganha navegação de mês nem qualquer mudança visual — só reaproveita as
  funções extraídas.
- Sem prioridade/esforço visíveis na célula (só no tooltip) — mantém a célula compacta, seguindo o
  padrão do `CalendarioEditorial`.

## Testes

Sem test runner no projeto (ver spec anterior). Validação via `tsc --noEmit`, `eslint`,
`next build`, e `/code-review` (high, por ser uma reescrita de componente) antes de reportar
pronto. Verificação manual no navegador fica por conta do usuário (sem credenciais de login no
Supabase real do projeto).
