# Shift+Enter no chat do keV e @menções em comentários com notificação

## Contexto

Duas sugestões de melhoria registradas espontaneamente pelo keV (Marco Rossi, 21/08/2026, tabela
`kev_sugestoes_sistema`):

1. Permitir `Shift+Enter` pra quebrar linha antes de enviar mensagem no chat do keV.
2. Permitir marcar (@mencionar) membros da equipe nos comentários dentro das atividades.

São duas melhorias independentes, mas nasceram do mesmo feedback e são pequenas o suficiente pra
compartilhar um único spec.

O sistema não tem nenhum mecanismo de notificação in-app hoje — a única notificação existente é
e-mail assíncrono (`enviarEmailsNovaSolicitacao`, via Resend) disparado em fluxos específicos.
Implementar @menção com aviso pra quem foi citado exige criar esse mecanismo do zero.

## Objetivo

- Chat do keV (`assistant-orb.tsx`) aceita `Shift+Enter` pra nova linha sem enviar a mensagem.
- Campo de comentário de tarefa (`task-detail-sheet.tsx`) ganha autocomplete de `@nome` que,
  ao ser confirmado, gera uma notificação in-app pro colaborador mencionado.
- Notificação in-app é genérica (campo `tipo`), pra suportar outros gatilhos no futuro — só
  `mencao_comentario` é produzido nesta entrega.

## Design

### 1. Shift+Enter no chat do keV

- `assistant-orb.tsx`: troca o `<input>` de uma linha (linha ~598) por um `<textarea>` de altura
  automática (cresce com o conteúdo até um teto, ex. ~5 linhas, depois rola).
- `onKeyDown`: `Enter` sem `Shift` previne o default e chama `enviar()` (comportamento atual,
  preservado); `Shift+Enter` deixa o comportamento default do textarea (insere `\n`).
- Nenhuma mudança na renderização do histórico: a bolha de mensagem do usuário já usa
  `whitespace-pre-wrap` (linha ~534), então quebras de linha em `\n` já aparecem corretamente.
- `enviar()` já lê de `texto`/`setTexto` (estado existente) — sem mudança de contrato, só de
  input control.

### 2. Autocomplete de @menção no comentário

Componente novo `MencaoComentarioInput` (ou lógica embutida direto em `task-detail-sheet.tsx`,
decidir no plano de implementação conforme tamanho) substituindo o uso do `Input` simples na
seção de comentários (linha ~1190):

- Mantém-se um campo de uma linha (comentário costuma ser curto — sem necessidade do tratamento
  de `Shift+Enter` da seção 1).
- Ao digitar `@`, abre um `Popover` (componente já existente em `src/components/ui/popover.tsx`)
  ancorado no campo, listando `useColaboradores()` filtrados pelo texto após o `@`
  (case-insensitive, substring no nome).
- Teclado: `↑`/`↓` navega, `Enter`/`Tab` confirma o item destacado, `Esc` fecha sem selecionar,
  clique do mouse também confirma.
- Ao confirmar, insere `@Nome Completo ` (texto puro) no campo e guarda em estado local do
  componente a lista de menções pendentes desse comentário: `{ colaboradorId, nome }[]`.
- Sem restrição de quem aparece na lista (equipe inteira, até 10 pessoas — não precisa filtrar por
  participantes da tarefa).

**Por que texto puro, não um token embutido tipo `@[Nome](id)`:** `comentarios.texto` é lido
diretamente por `kev-tarefa.ts` (linha ~144) como contexto de prompt pro keV. Embutir marcação no
texto polui esse contexto. A menção estruturada fica numa tabela separada (abaixo); o texto
visível continua exatamente o que a pessoa digitou.

### 3. Banco de dados

Duas tabelas novas, já criadas e protegidas em produção durante este design:

**`comentario_mencoes`** (migration `0018`) — relação comentário → colaborador mencionado.
Policy de leitura igual ao resto do schema principal (`is_kev_colaborador()`, time inteiro).

**`notificacoes`** (migration `0019`) — notificação in-app genérica por `tipo` (`colaborador_id`
destinatário, `tipo` texto livre, `tarefa_id` opcional, `mensagem`, `lida` boolean). Policy
restrita ao dono (mesmo padrão de `kev_mensagens`/`kev_memoria`, migration `0010`), diferente do
resto do schema — é dado pessoal, não faz sentido o time inteiro ver notificação de outra pessoa.

Ver os arquivos de migration pro SQL completo (ambos já aplicados em produção).

### 4. Fluxo de escrita do comentário com menção

`adicionarComentario` (`task-store.ts`, linha ~870) ganha um parâmetro opcional de menções:

```ts
adicionarComentario(taskId: string, texto: string, mencoes?: { colaboradorId: string }[])
```

Fluxo, na mesma função:
1. Insere o comentário em `comentarios` (sem mudança).
2. Se `mencoes` não vazio: insere uma linha em `comentario_mencoes` por menção
   (`comentario_id`, `colaborador_id`).
3. Pra cada colaborador mencionado que **não seja o autor do comentário** (sem auto-notificação):
   insere uma linha em `notificacoes` com `tipo: "mencao_comentario"`, `tarefa_id: taskId`,
   `mensagem` no formato `"<Nome do autor> mencionou você num comentário em <título da tarefa>"`.
4. Atualiza o estado local (`tasks`) e emite, como já faz hoje.

Nome do autor e título da tarefa já estão disponíveis no escopo (colaborador atual via
`obterColaboradorAtual()`, tarefa via `tasks.find`).

### 5. `notificacao-store.ts` (novo)

Segue o mesmo padrão de `task-store.ts`/`colaborador-store.ts`: array em memória +
`useSyncExternalStore`, hidratado do Supabase (`select * from notificacoes where colaborador_id =
<atual> order by criado_em desc`) na primeira montagem. Sem realtime/subscription — time pequeno,
atualização ao montar o componente e após ações locais (marcar como lida) é suficiente.

API exposta:
- `useNotificacoes(): Notificacao[]`
- `useNotificacoesNaoLidas(): number` (ou derivar do array acima no componente — decidir no plano)
- `marcarNotificacaoLida(id: string)`

### 6. Sino no topbar

`app-topbar.tsx`: novo botão de sino antes do `ThemeToggle`, mesmo estilo dos ícones existentes
(`LogOut`). Badge com contador de não lidas sobre o ícone, só visível quando > 0.

Clique abre um `Popover` listando as notificações (mensagem + tempo relativo, mais recentes
primeiro). Clicar numa notificação chama `marcarNotificacaoLida(id)` e navega pra
`?tarefa=<tarefa_id>` via `router.push` (mesmo mecanismo usado em `kanban-board.tsx`, linha ~113)
— abre o `TaskDetailSheet` na tarefa comentada, de qualquer página, já que o sheet fica montado no
layout (`src/app/(app)/layout.tsx`).

## Casos de borda

- **Autor se automenciona:** menção é registrada em `comentario_mencoes` (histórico correto), mas
  nenhuma notificação é criada.
- **Colaborador mencionado duas vezes no mesmo comentário:** dedup no componente antes de enviar
  (mesma pessoa não gera duas linhas em `comentario_mencoes`/`notificacoes`).
- **Tarefa excluída depois da notificação existir:** `tarefa_id` tem `on delete cascade`, então a
  notificação some junto — comportamento aceitável (não faz sentido notificar sobre tarefa que não
  existe mais).
- **Dois colaboradores com nomes muito parecidos:** lista do autocomplete mostra nome completo
  (evita ambiguidade); segue o textual exato do nome escolhido, não há resolução automática de
  colisão além disso.

## Fora de escopo

- Notificação por e-mail para @menção (decidido explicitamente: só in-app).
- Outros tipos de notificação além de `mencao_comentario` (a tabela é genérica, mas só esse
  produtor é implementado agora).
- Realtime/push (WebSocket, polling) — atualização é on-mount/on-action.
- Editar ou apagar uma menção depois de enviado o comentário.
- Restringir a lista de menção aos participantes da tarefa (lista é sempre a equipe inteira).

## Testes

Projeto não tem test runner configurado — validação via `tsc --noEmit`, `eslint` e `next build`
limpos, mais verificação manual:

- Chat do keV: `Shift+Enter` quebra linha sem enviar; `Enter` sozinho envia; mensagem multi-linha
  aparece corretamente formatada no histórico.
- Comentário: digitar `@` abre a lista; filtrar por texto funciona; navegação por teclado e clique
  confirmam a seleção; comentário final mostra o nome digitado normalmente (sem marcação visível).
- Mencionar um colega gera notificação pra ele (login como esse colaborador, ver o sino com
  contador); mencionar a si mesmo não gera notificação própria.
- Clicar na notificação marca como lida (contador desce) e abre a tarefa certa.
- RLS: colaborador A não consegue ver notificação de colaborador B (verificar via SQL editor com
  `auth.uid()` diferente, ou revisão de código da policy).
