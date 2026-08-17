# Convite proativo do keV ao abrir uma atividade

## Contexto

Hoje o keV (`src/components/assistant-orb.tsx`) só reage quando a pessoa clica no botão
flutuante: aí pergunta "continuar conversa" ou "nova conversa" (`decisaoPendente`) e segue dali.
Ele não tem nenhuma ligação com o resto da UI — estado 100% local ao componente.

O `TaskDetailSheet` (`src/components/task-detail-sheet.tsx`) abre via `?tarefa=<id>` na URL (lido
com `useSearchParams`), sem página dedicada — é um overlay global montado no
`src/app/(app)/layout.tsx`, junto do `AssistantOrb`.

O chat do keV (`src/app/api/chat/route.ts`) já sabe calcular "quem é responsável pela etapa atual
de uma tarefa" — a tool `buscarAtividades` faz isso via `etapaAtualDe`/`ehMinhaAtividade`, duas
closures locais ao handler. E o mapeamento completo de uma tarefa (checklist, comentários,
histórico, planejamento) já existe centralizado em `linhaParaTarefa`/`SELECT_TAREFA`
(`src/lib/tarefa-mapper.ts`), usado tanto pelas telas quanto pelo keV.

## Objetivo

Quando a pessoa abre o detalhe de uma tarefa em que ela é a responsável pela etapa atual (ou
seja, é a vez dela agir), o keV oferece ajuda proativamente — sem que ela precise abrir o chat
primeiro. Se ela topar (ou só continuar a conversa), o keV tem acesso ao contexto completo
daquela tarefa pra ajudar de verdade nas etapas, não só no convite.

## Design

### Fluxo

1. `AssistantOrb` observa `useSearchParams().get("tarefa")` (mesma fonte que o `TaskDetailSheet`
   já usa — nenhum estado global novo).
2. Quando esse id muda pra um valor novo (tarefa diferente da que estava focada), chama a server
   action `avaliarConviteTarefaKev(tarefaId)`.
3. A action busca a tarefa (`SELECT_TAREFA`/`linhaParaTarefa`), calcula a etapa atual e seu
   responsável (helper compartilhado, ver abaixo) e decide:
   - Se o usuário logado não é o responsável pela etapa atual → `{ elegivel: false }`, nada
     acontece.
   - Se é responsável mas já existe um convite registrado pra essa etapa específica dessa tarefa
     → `{ elegivel: true, jaConvidado: true }`, nada acontece (sem repetir).
   - Se é responsável e ainda não foi convidado → gera (LLM, mesmo tom/regras de
     `gerarMensagemNovaConversa`) uma pergunta curta referenciando o título da tarefa, salva como
     mensagem normal em `kev_mensagens` (role `assistant`), registra o convite em
     `kev_convites_atividade` (dedup) e retorna `{ elegivel: true, jaConvidado: false, mensagem }`.
4. No cliente, se `elegivel && !jaConvidado`:
   - Painel fechado (`aberto === false`) → abre o painel, pula a tela de decisão
     (`setDecisaoPendente(false)`) e carrega a conversa de hoje via o mesmo caminho de
     `continuarConversa()` (que já vai trazer o convite recém-inserido como última mensagem).
   - Painel já aberto → só acrescenta a mensagem do convite ao `messages` atual
     (`setMessages(prev => [...prev, novaMensagem])`), sem mexer no que já estava sendo
     conversado.
   - Em ambos os casos, seta `tarefaFocadaId = tarefaId`.
5. Enquanto `tarefaFocadaId` estiver setado, toda chamada de `sendMessage` inclui esse id no corpo
   da requisição pro `/api/chat`. `tarefaFocadaId` acompanha o `?tarefa=` da URL: some quando a
   tarefa fecha (parâmetro sai da URL) ou muda pra outra.
6. No servidor, `route.ts` passa a ler `tarefaFocadaId` do corpo da requisição; quando presente,
   busca a tarefa (mesmo `SELECT_TAREFA`/`linhaParaTarefa`) e injeta um bloco extra no system
   prompt: **CONTEXTO DA ATIVIDADE EM FOCO** — título, descrição, tipo/fluxo, etapa atual e prazo,
   itens do checklist, comentários e histórico. Buscado a cada request (não cacheado), então se a
   etapa avançar no meio da conversa o contexto já vem atualizado na próxima mensagem.

### Escopo de ação do keV

Só orientação/Q&A com o contexto da tarefa. Nenhuma tool nova de escrita — quem mexe na tarefa
(comentário, tempo, checklist, avançar etapa) continua sendo a pessoa, na própria tela. Fica pra
uma iteração futura, se fizer sentido.

### Banco de dados

Nova tabela `kev_convites_atividade`:

```
colaborador_id  uuid  references colaboradores(id)
tarefa_id       uuid  references tarefas(id)
etapa_ref       text  -- id da etapa dentro do planejamento (planejamento_etapas.id) quando a
                       -- tarefa tem planejamento; senão, fase_atual_id (fallback pra tarefas sem
                       -- planejamento, mesma distinção que ehMinhaAtividade já faz)
criado_em       timestamptz default now()
unique (colaborador_id, tarefa_id, etapa_ref)
```

RLS igual `kev_mensagens`/`kev_memoria`: cada colaborador só vê/insere as próprias linhas. Usar
`etapa_ref` (não o id genérico da etapa no catálogo) evita que a tarefa repetir a mesma etapa mais
adiante no fluxo seja tratada como "já convidado".

Guardar o dedup no servidor (não em `localStorage`, diferente do que hoje guarda a posição do
botão do keV) porque precisa sobreviver entre abas/dispositivos, do mesmo jeito que o histórico de
conversa já sobrevive.

### Servidor

- Extrair `etapaAtualDe`/`ehMinhaAtividade` (hoje closures dentro de `route.ts`) pra
  `src/lib/tarefa-etapa.ts`, funções puras sobre a forma `Tarefa` mapeada — reaproveitadas pela
  tool `buscarAtividades` existente e pela nova `avaliarConviteTarefaKev`.
- Novo arquivo `src/lib/kev-tarefa.ts`: `avaliarConviteTarefaKev(tarefaId)` (fluxo descrito acima).
- `route.ts`: aceitar `tarefaFocadaId?: string` no corpo da requisição de chat; quando presente,
  buscar a tarefa e montar o bloco de contexto (nova função auxiliar, ex.
  `montarContextoTarefaFocada(tarefa)`); passar pra `montarSystemPrompt` como parâmetro adicional.
  Se a tarefa não existir mais (excluída/id inválido), ignora o campo silenciosamente — mesmo
  comportamento de fallback que `carregarContextoAnteriorKev` já tem quando não há dado.

### Cliente (`assistant-orb.tsx`)

- Novo estado `tarefaFocadaId: string | null`, sincronizado a partir de `useSearchParams()`.
- `useEffect` que dispara `avaliarConviteTarefaKev` quando o id da URL muda pra um valor novo (e
  ainda não avaliado nesta sessão de foco).
- `enviar()` passa `tarefaFocadaId` (quando setado) no corpo de cada `sendMessage`.

## Casos de borda

- **Tarefa concluída/arquivada no meio da conversa:** a próxima mensagem simplesmente não injeta
  mais contexto útil (a tarefa sai do filtro de "ativas" que `buscarAtividades` já aplica); não é
  um caso que precisa de tratamento especial — o keV responde com o que conseguir buscar.
- **Usuário abre uma tarefa, fecha, abre outra tarefa (é responsável pelas duas etapas):** cada
  uma dispara sua própria avaliação de convite (chave é `tarefa_id + etapa_ref`), então pode gerar
  dois convites diferentes na mesma conversa, um por tarefa.
- **Chat em "nova conversa" pendente de decisão (`decisaoPendente = true`) quando o convite
  chega:** o convite força `decisaoPendente = false` e abre a tela de mensagens diretamente (o
  convite "decide" por continuar, já que a mensagem dele mesmo entra como parte da conversa de
  hoje).

## Fora de escopo

- Nenhuma tool de escrita (comentário, tempo, checklist, avançar etapa) via chat.
- Nenhum indicador visual no botão flutuante do keV (badge/pulso) — o painel abre direto.
- Nenhuma mudança em `TaskDetailSheet` — ele continua sem saber que o keV existe.

## Testes

Projeto não tem test runner configurado — validação via `tsc --noEmit`, `eslint` e `next build`
limpos, mais verificação manual: abrir uma tarefa onde sou responsável pela etapa atual com o
painel do keV fechado (deve abrir sozinho com o convite); fechar e reabrir a mesma tarefa sem
mudar de etapa (não deve convidar de novo); abrir uma tarefa onde NÃO sou responsável pela etapa
atual (não deve convidar); abrir uma tarefa com o painel do keV já aberto numa conversa em
andamento (convite deve entrar como mensagem nova, sem apagar o que já estava lá); perguntar algo
específico da tarefa em foco (ex. prazo, itens do checklist) e confirmar que a resposta bate com
os dados reais da tela.
