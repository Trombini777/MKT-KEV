# Plano de Execução — Sistema de Gestão de Marketing (Kev Seguros)

Baseado em [CLAUDE.md](../CLAUDE.md) e [PRD.md](PRD.md).

## Metodologia

UI-first com dados mock, depois backend real (Supabase). Cada milestone entrega algo visível e
testável antes de passar para o próximo. Convenção de branch: `feat/NN-nome-do-milestone`.

**Nota (pré-visualização adiantada):** a pedido do usuário, as telas de UI de M1 e também as
telas de M3 a M8 foram construídas de uma vez, fora de ordem, todas com dados mock e sem
backend real. Isso cobre a camada visual/interativa de cada milestone, mas **não** as entregas
de schema/CRUD/RLS do Supabase listadas em cada um (M2, e as partes de backend de M3-M8) — essas
continuam pendentes e devem ser feitas milestone a milestone, como planejado. Os checkboxes de
UI de cada milestone abaixo foram marcados quando a tela correspondente já existe; os de
schema/backend continuam em aberto.

---

## M0 — Setup do Projeto e Fundação
**Branch:** `feat/00-setup-fundacao`
**Objetivo:** Ter um projeto Next.js rodando, com autenticação básica, deploy funcionando na
Vercel e Supabase conectado (mesmo que ainda sem schema de domínio).
**Entregas:**
- [ ] `create-next-app` (App Router, TypeScript, Tailwind), shadcn/ui inicializado
- [ ] Projeto Supabase criado, variáveis de ambiente configuradas (`.env.local`, não commitado)
- [ ] Auth básica (login por e-mail/senha via Supabase Auth) — sem fluxo de convite complexo,
      só criação manual dos ~10 usuários do time
- [ ] **Identidade visual**: tokens de cor no Tailwind a partir da marca Kev (verde-limão
      `#CFF74A` como accent, preto `#000000`, cinza `#F2F2F2`, branco — extraídos de
      `Identidade visual Kev/Apresentação Institucional`), tema shadcn/ui ajustado (light/dark),
      logo Kev no layout (sidebar/header, variante clara e escura). Tipografia: Geist (padrão
      shadcn/ui) por ora — a fonte oficial da marca (PP Mori) tem licença "free for personal
      use" que não cobre uso no sistema; revisitar se a Kev obtiver licença comercial
- [ ] Layout base da aplicação (sidebar, navegação entre módulos)
- [ ] Deploy inicial na Vercel (preview funcionando)
- [ ] `.gitignore` cobrindo `.env*`, `.vercel/`, `.claude/settings.local.json`
**Commit final:** `chore: setup inicial do projeto e deploy`

---

## M1 — Fluxo de Trabalho, Tipos de Tarefa e Tela de Tarefas (UI-first, dados mock)
**Branch:** `feat/01-fluxo-tarefas-ui`
**Objetivo:** Validar a experiência central do sistema — Kanban e detalhe de tarefa — com dados
mock, antes de desenhar o schema real.
**Entregas:**
- [x] Tela de configuração de Fluxo de Trabalho como **grafo** (cada fase define explicitamente
      pra quais outras fases pode ir — não só "próxima da lista"), SLA por fase, fase(s)
      final(is), atributo **Modo de execução** (Individual | Coletiva) por fase — com dados mock
- [x] Fluxo padrão pré-carregado (mock) com as 8 fases reais: Solicitações → Triagem ⇄
      Aguardando Informações → Backlog → Em Execução → Aprovação → Concluído, com Refação como
      desvio de Aprovação de volta pra Em Execução
- [x] Tela de Tipos de Tarefa por canal/formato (Post Social, E-mail, Peça para Corretor, Banner,
      Vídeo, Comunicado Interno, Material de Campanha) com dados mock
- [x] Formulário de Solicitação (mock): nome do solicitante, e-mail, Departamento/Área, título,
      descrição, prioridade sugerida, justificativa (condicional se Alta), anexos, observações,
      além de "tem prazo limite?" (data + justificativa do prazo)
- [x] View Kanban de tarefas (colunas = fases do fluxo) com dados mock
- [x] Modal/painel de detalhe de tarefa: título, descrição, tipo, origem, **Executor por Fase**
      (não mais um único responsável), participantes, prioridade, datas, **estimativa de horas
      por fase**, checklist, anexos (placeholder), comentários com @menção, histórico de
      mudanças — tudo com dados mock
- [x] Transição de etapa (drag-and-drop no Kanban + botão "Mover etapa"), respeitando só os
      destinos definidos no grafo da fase atual
**Commit final:** `feat: telas de fluxo de trabalho (grafo), tipos de tarefa e kanban (mock)`
**Status:** UI-first completo (dados mock). Pendente: revisão do usuário.

---

## M2 — Tarefas: Backend Real
**Branch:** `feat/02-tarefas-backend`
**Objetivo:** Substituir os dados mock do M1 por Supabase real.
**Entregas:**
- [ ] Schema Supabase: `workflows`, `phases` (com tabela de arestas `phase_transitions` pra
      representar o grafo — origem, destino), `task_types`, `tasks` (origem, participantes,
      prioridade sugerida/final, datas, etapa), `task_phase_executions` (tarefa, fase, executor(es),
      estimativa_horas, status — substitui um campo único `responsável`)
- [ ] `departamentos` (lookup fechado com as ~29 áreas da Kev — Agronegócio, Assistência
      Financeira, ..., KEV, Autoday, Side, Estrutural, Projetos, Conecta)
- [ ] `default_executors` (Tipo de Tarefa × Fase → colaborador padrão), consumido na criação da
      tarefa pra pré-preencher `task_phase_executions`
- [ ] Níveis de prioridade final (Crítica/Alta/Normal/Baixa) como enum, com a definição de
      critério do PRD E1 documentada na própria UI (tooltip/help text); prioridade sugerida
      (Alta/Regular/Baixa) como campo separado, só preenchido em Solicitações
- [ ] Campo `prazo` (compromisso, editável) separado de `previsão_conclusão` (calculado,
      read-only) na tabela `tasks` — a coluna calculada só ganha valor real no M5 (motor de fila)
- [ ] Formulário público de Solicitação (rota sem autenticação, substitui o Pipefy) + botão
      "Criar solicitação" dentro do sistema — mesmos campos, ambos criam a tarefa na fase
      Solicitações
- [ ] RLS por usuário autenticado (sem isolamento por workspace/tenant); rota pública de
      Solicitação com policy própria (insert-only, sem leitura de outros dados)
- [ ] CRUD real de fluxo (grafo), fases, tipos de tarefa e tarefas
- [ ] Transições de etapa persistidas, validadas contra `phase_transitions` (histórico: quem
      moveu, quando, tempo na fase anterior)
- [ ] Dependências entre tarefas (bloqueante / bloqueada por)
- [ ] Checklist, comentários com @menção e histórico de mudanças persistidos
- [ ] Tarefas recorrentes (config de recorrência diária/semanal/mensal + geração automática da
      próxima ocorrência, reaplicando os executores padrão por fase)
- [ ] Tags (entidade própria, N:M com tarefas e projetos, CRUD de tags)
- [ ] Modelos de Checklist (templates reutilizáveis inseríveis em qualquer tarefa, além do
      checklist ad-hoc)
**Commit final:** `feat: schema e CRUD real de tarefas, fluxo (grafo) e solicitação pública`

---

## M3 — Projetos e Campanhas
**Branch:** `feat/03-projetos-campanhas`
**Objetivo:** Agrupar tarefas em projetos/campanhas com progresso automático.
**Entregas:**
- [ ] Schema + CRUD de Projeto (nome, sigla, descrição, responsável, datas, progresso automático)
- [ ] Associação de tarefas a projeto (N:1)
- [x] Tela de lista + detalhe do projeto: progresso, tarefas atrasadas, lista de tarefas (mock)
- [ ] Templates de campanha reutilizáveis (estrutura de tarefas pré-definida para campanhas
      sazonais recorrentes)
- [x] **Notas de Encerramento**: campo de texto na tela de detalhe (mock, não persiste)
**Commit final:** `feat: projetos, campanhas e templates`

---

## M4 — Times e Pessoas
**Branch:** `feat/04-times-pessoas`
**Objetivo:** Cadastro simples de colaboradores com capacidade, base para o planejamento semanal.
**Entregas:**
- [ ] Schema + CRUD de colaborador (nome, e-mail, cargo, skills, capacidade em horas/semana,
      status Ativo/Licença/Inativo)
- [x] Squads (agrupamento leve acima do colaborador — mock, tela de Pessoas agrupada por squad)
- [x] Tela de configuração do Executor Padrão por Tipo de Tarefa × Fase (mock, somente leitura)
- [ ] Executores de fase e participantes de tarefa passam a referenciar colaboradores reais
      (não mock)
- [ ] Regra de reatribuição ao marcar colaborador como Inativo (execuções de fase ativas dele
      precisam de novo executor)
**Commit final:** `feat: cadastro de colaboradores, squads e capacidade`

---

## M5 — Backlog, Priorização e Planejamento Semanal (núcleo diferencial)
**Branch:** `feat/05-planejamento-semanal`
**Objetivo:** Entregar o ciclo central do sistema: backlog priorizado → planejamento semanal por
capacidade → semana equilibrada.
**Entregas:**
- [x] Tela de **Triagem**: fila de Solicitações pendentes, ajusta Tipo/Prioridade final/data de
      início e libera para o Backlog (mock, sem Motor de Previsão real ainda)
- [x] Tela de Backlog: lista/ordena/filtra por prioridade, origem, tipo (mock)
- [x] Tela de Planejamento Semanal: aloca tarefa do backlog num dia/colaborador, grade da semana
      (mock, alocação local não persistida)
- [x] Sinalização visual de sobrecarga **por dia** (verde/amarelo/vermelho) — não bloqueia, só avisa
- [ ] Ajuste manual completo (mover tarefa entre pessoas/dias já alocados) — hoje só aloca, não
      realoca
- [ ] Registro do planejamento fechado (para comparar planejado vs. entregue no M7) — botão
      "Fechar" existe mas não persiste
- [ ] **Motor de Previsão por Fila de Capacidade**: simulação diária real — hoje `previsão de
      conclusão` é dado mock por tarefa, não calculado
- [x] Cálculo de **folga de prazo** (`prazo − previsão_conclusão`) e flag "em risco" — lógica de
      comparação real, alimentada por datas mock
- [ ] **Motor de Sugestão de Replanejamento** — não implementado
- [x] **Painel de Trabalho** — tela inicial do sistema em `/painel`: Resumo, Para executar agora,
      Entrando em breve, Pendente de Triagem (mock)
**Commit final:** `feat: backlog, priorização, previsão de fila, sugestão e painel de trabalho`

---

## M6 — Visualizações Completas
**Branch:** `feat/06-visualizacoes`
**Objetivo:** Completar as views de tarefas além do Kanban.
**Entregas:**
- [x] View Lista (mock) — filtros de tipo, origem, prioridade e situação implementados; faltam
      Departamento/Área, projeto, squad, tags, prazo e filtros salvos
- [x] View Calendário editorial (mock, mês atual)
- [x] View Workload — grade **pessoa × dia**, seletor 7/15/30 dias, célula colorida por carga
      (mock). **Nunca bloqueia** over-allocation, só sinaliza
- [x] View Gantt (mock) — barras por data de tarefa/projeto; setas de dependência
      bloqueante/bloqueada por ainda não implementadas (falta o campo de dependência no modelo)
**Commit final:** `feat: views de lista, calendário, workload e gantt`

---

## M7 — Dashboards de Performance
**Branch:** `feat/07-dashboards-performance`
**Objetivo:** Camada analítica para acompanhar produtividade e fechar o ciclo do planejamento
semanal.
**Entregas:**
- [x] Dashboard "Gestão de Produtividade" (ativas, a vencer, atrasadas, em risco) — mock
- [x] Dashboard "Atividades por Pessoa" (mock)
- [x] Dashboard "Atividades por Etapa" (mock)
- [x] Dashboard "Atividades por Squad" (mock)
- [x] Dashboard "Atividades por Departamento/Área solicitante" (mock)
- [x] Comparativo planejado vs. entregue por semana — números ilustrativos fixos, ainda não
      vêm do registro real de planejamento fechado (M5)
**Commit final:** `feat: dashboards de performance e produtividade`

---

## M8 — Usuários e Permissões
**Branch:** `feat/08-usuarios-permissoes`
**Objetivo:** Formalizar os 3 níveis de acesso para os ~10 usuários reais do time.
**Entregas:**
- [ ] Perfis Admin / Editor / Viewer aplicados via RLS e nas telas (esconder ações não permitidas)
- [x] Tela de gestão de usuários (mock: lista + troca de perfil local, não persiste)
- [ ] Ajuste fino de RLS por perfil nas tabelas de domínio (tarefas, projetos, colaboradores)
**Commit final:** `feat: perfis de acesso admin/editor/viewer`

---

## M9 — Polish e Deploy Final
**Branch:** `feat/09-polish-deploy`
**Objetivo:** Fechar loose ends antes de considerar o MVP pronto para uso real pelo time.
**Entregas:**
- [ ] Revisão de UX ponta a ponta (estados vazios, loading, erros)
- [ ] `tsc --noEmit`, `eslint`, `next build` limpos
- [ ] `/code-review` high nas áreas críticas (auth, RLS, planejamento semanal)
- [ ] Deploy de produção na Vercel, checklist de segurança pre/post-push (CLAUDE.md)
- [ ] Onboarding mínimo dos ~10 usuários (criação de conta, primeiro login)
**Commit final:** `chore: polish final e release do MVP`

---

## Fora do MVP (registrado, não esquecido)

Ver [PRD.md §6](PRD.md#6-fora-de-escopo-explicitamente-com-justificativa) — integrações
Slack/Teams, app mobile, orçamento/faturamento, permissão granular por campo, multi-workspace
isolado por BU, e os módulos auxiliares de fase 2 (Modelos de Mensagem, Personas, Públicos,
Conhecimento/Boards, Biblioteca/Artifacts, Chat com IA). Reavaliar após o M9 se surgir
necessidade real.
