# Análise do Sistema Ekyte como Inspiração para um Sistema de Gestão de Tarefas do Time de Marketing da Kev Seguros

> Documento de referência produzido a partir da leitura dos arquivos de mapeamento do Ekyte em `novo projeto/Sistema Ekyte/`. Objetivo: extrair conceitos e features reaproveitáveis para um sistema próprio, feito para o time de marketing **interno** da Kev Seguros — não para replicar o Ekyte nem integrar com ele.

---

## 1. Visão Geral do Ekyte

O **Ekyte** é uma plataforma de gestão de marketing digital / produtividade, descrita nos próprios documentos como um "ERP/CRM focado em colaboração, produtividade e gestão de campanhas de marketing". Proposta de valor explícita: **"menos Jira complexo, mais simples e direto ao ponto para marketing"**.

- **Público-alvo:** equipes de marketing pequenas e médias (5-8 pessoas por equipe), mas com capacidade de escalar para múltiplas Business Units (o material usa a Kev Seguros com 14 BUs como caso de uso de referência) e para **agências que atendem múltiplos clientes externos**.
- **Modelo mental central:** Workspace → Equipes/Profissionais → Fluxo de Trabalho → Tipos de Tarefa → Projetos → Tarefas → (tudo monitorado por) Data-Driven.
- **9 módulos** que compõem o sistema:
  1. Workspaces (organização/isolamento)
  2. Equipes e Profissionais (quem trabalha)
  3. Fluxo de Trabalho (como o trabalho flui — fases/etapas)
  4. Tipos de Tarefa (categorias de trabalho)
  5. Tarefas (unidade de execução)
  6. Projetos (agrupador de tarefas)
  7. Usuários e Permissões
  8. Canais e Integrações (Slack, e-mail, Teams — arquivo vazio na base analisada)
  9. Data-Driven (analytics/dashboards)
- **Regra de ouro do sistema:** não é possível criar uma tarefa sem um **Fluxo de Trabalho ativo**, e um Tipo de Tarefa está sempre amarrado a um Fluxo. Ou seja, o fluxo é a espinha dorsal — tudo (tipos, tarefas, times alocados) se organiza em torno dele.
- **Múltiplas visualizações** de tarefas: Lista, Kanban, Calendário, Gantt e **Workload** (grade pessoa × período mostrando carga de trabalho).

---

## 2. Modelo de Dados / Entidades Principais

### Hierarquia geral

```
Empresa (Kev Seguros)
 └─ Workspace (ex.: 1 por BU, ou 1 por área/squad)
     ├─ Fluxo(s) de Trabalho (1 obrigatório, pode ter vários; 1 marcado como "padrão")
     │   └─ Fases/Etapas (ordenadas, com ícone, cor, SLA em dias, flag "é fase final?")
     ├─ Tipos de Tarefa (amarrados a um Fluxo)
     ├─ Squads → Equipes → Profissionais (hierarquia organizacional)
     ├─ Projetos (opcional, agrupador)
     │   └─ Tarefas (N:1 com projeto — 1 tarefa pertence a no máximo 1 projeto)
     ├─ Tarefas (podem existir sem projeto)
     └─ Usuários com permissão de acesso (Admin/Editor/Viewer, granular por workspace)
```

### Cardinalidades chave
- **Workspace : Projeto** = 1:N (todo projeto pertence a exatamente 1 workspace)
- **Workspace : Fluxo de Trabalho** = 1:N (1 fluxo marcado como padrão)
- **Fluxo : Fase** = 1:N (mínimo 2 fases, ao menos 1 marcada como final)
- **Fluxo : Tipo de Tarefa** = 1:N (tipo de tarefa não existe sem fluxo)
- **Projeto : Tarefa** = 1:N
- **Tarefa : Responsável** = N:1 (só 1 responsável principal)
- **Tarefa : Participantes** = N:M (colaboradores, ilimitados)
- **Squad : Equipe** = 1:N; **Equipe : Profissional** = N:M (via tabela associativa com cargo, data de admissão, status)
- **Profissional : Fase do fluxo** = N:M — "alocação em fase", com % de capacidade, nível de experiência (júnior/sênior/lead) e datas de início/fim. É a modelagem de **"quem pode/deve trabalhar em qual etapa"**, separada de "quem está na equipe".
- **Usuário : Workspace** = N:M — um mesmo usuário pode ter papéis diferentes em workspaces diferentes (ex.: Admin no workspace A, Editor no workspace B).
- **Profissional : Usuário** = 1:1 (todo profissional cadastrado gera/está ligado a uma conta de usuário).

### Campos centrais de cada entidade (os mais reaproveitáveis)

**Tarefa:** título, descrição (rich text, com @menção), tipo, workspace, fluxo, etapa atual (auto-preenchida pela 1ª fase do fluxo, só muda por transição formal), tags (até 10), responsável (obrigatório, único), participantes (múltiplos), squad, prioridade (Crítica/Alta/Normal/Baixa), data de início, data de término/deadline, estimativa de esforço (horas), projeto, tarefas relacionadas (bloqueante / bloqueada por / relacionada), checklist, anexos (até ~20 arquivos, 100MB cada).

**Projeto:** nome, sigla/código curto (ex. "SEC-2024"), descrição, ícone, responsável (PM, único), equipe (múltiplos membros), squad, data de início, data de conclusão planejada, duração estimada, workspace, privacidade (privado/público), "baseado em modelo" (template), tags, orçamento, esforço estimado (horas). Métricas derivadas: % de progresso, contagem de tarefas por status, tarefas atrasadas, burndown chart, tendência de esforço (subindo/normal/caindo), alocação de equipe (%).

**Fluxo de Trabalho / Fase:** nome do fluxo, descrição, "é padrão?" (só 1 por workspace), status ativo/inativo, publicado/rascunho. Cada fase: nome, ícone, cor, ordem, SLA (dias), "é fase final?" (pode haver mais de uma fase final, ex. Concluído e Cancelado).

**Tipo de Tarefa:** nome, descrição, ícone, cor, fluxo ao qual pertence, status ativo/inativo.

**Profissional:** nome completo, e-mail, cargo/função, foto, data de admissão, capacidade (% FTE: 100/75/50/25), reporta para (manager), skills/tags (multi-select com autocomplete), status (Ativo / Em Licença / Inativo), equipes (múltiplas), alocação em fases (com % de capacidade e senioridade).

**Usuário:** nome, e-mail, perfil/role (Admin/Editor/Viewer), workspace principal, fluxo padrão preferido, status ativo/inativo, status de convite (Sem convite / Convidado / Pendente / Ativo / Inativo).

**Workspace:** nome, proprietário/owner, squad associado, tipo de acesso (Todos / Somente Equipe / Privado / Customizado), fluxo de trabalho padrão (obrigatório), tags, status ativo/inativo.

---

## 3. Fluxo de Trabalho (como uma tarefa nasce e evolui)

1. **Pré-requisito:** precisa existir workspace + fluxo ativo (com ≥2 fases e ≥1 fase final) + pelo menos um tipo de tarefa vinculado ao fluxo.
2. **Criação:** usuário preenche título, tipo, workspace, fluxo (auto-seleciona a etapa inicial = 1ª fase do fluxo), responsável, prioridade, datas, estimativa, projeto (opcional). Ao salvar: gera ID único, entra na 1ª fase, registra criador + timestamp, notifica o responsável.
3. **Transição entre etapas** (o "motor" do sistema):
   - Pode avançar sequencialmente para a próxima fase da ordem definida (não pode "pular" fases).
   - Pode ir para **qualquer fase final** a partir de qualquer ponto (ex.: Cancelado, de qualquer etapa).
   - Pode retroceder para a fase anterior (revert), útil para retrabalho.
   - Cada transição registra: quem moveu, data/hora, tempo gasto na fase anterior, reinicia o SLA da nova fase, dispara notificações a responsável + participantes.
   - Movimentação pode ser via drag-and-drop no Kanban, botão "Mover etapa" (mostra só as próximas fases válidas) ou clique direto na etapa no detalhe da tarefa.
4. **SLA por etapa:** cada fase pode ter um limite de dias; se a tarefa ultrapassar, é sinalizada como atrasada — isso alimenta diretamente o Data-Driven ("Atividades por Etapa" identifica gargalos).
5. **Colaboração durante a execução:** comentários com @menção e threads (respostas aninhadas), checklist com % de progresso automático, anexos com histórico de quem subiu o quê, histórico de mudanças completo (campo, valor antes → depois, quem, quando).
6. **Casos de uso documentados de fluxo com aprovação multi-etapa** (relevante para marketing): Solicitação → Análise → Aprovação → Implementação → Deploy/Publicação, onde cada etapa tem um responsável distinto (analista, product owner/aprovador, executor, publicador) e o sistema registra quem aprovou e quando.
7. **Conclusão:** ao entrar em fase marcada como final, o sistema registra data de conclusão, tempo total (criação → conclusão) e dispara notificações finais; métricas de projeto e dashboards são recalculados automaticamente.
8. **Dependências entre tarefas:** bloqueante / bloqueada por / relacionada — uma tarefa "bloqueada por" não pode ser movida para fase final enquanto a bloqueante não terminar. Isso é visualizado no Gantt com setas de dependência.

---

## 4. Funcionalidades por Módulo (o que é replicável)

### Workspaces
- Container de isolamento de dados (nome, proprietário, tipo de acesso, fluxo padrão, tags, status ativo/inativo).
- 4 tipos de acesso: Todos / Somente Equipe / Privado / Customizado (permissões granulares).
- Regras de negócio fortes e úteis de copiar: nome único por empresa, sempre precisa existir 1 workspace "padrão" que não pode ser deletado, não pode deletar workspace com projetos ativos, mudar o fluxo padrão não afeta tarefas já existentes (só as novas).
- Duplicação de workspace com opção de copiar (ou não) configurações, projetos, fluxos, usuários e tags — útil como "criar workspace a partir de modelo".

### Projetos
- Agrupador de tarefas com métricas agregadas automáticas: progresso (%), esforço estimado vs. gasto, burndown chart, tendência de esforço, tarefas atrasadas, orçamento gasto vs. total.
- Ciclo de vida: Planejado → Em Execução → Concluído / Cancelado → Arquivado (reversível).
- Modelos de projeto (templates) que já vêm com estrutura de tarefas pré-definida — exemplo citado no próprio material: template "Marketing Campaign" com tarefas Strategy → Creative → Copywriting → Approval → Publish.
- Permissões diferenciadas: Admin (tudo), Responsável/PM (edita, gerencia equipe, não deleta), Membro (edita tarefas do projeto, não edita dados do projeto), Visualizador (read-only).

### Tarefas
- 5 visualizações: Lista, Kanban, Calendário, Gantt, **Workload** (grade de carga por pessoa/semana com cores verde/amarelo/vermelho por nível de ocupação) — a visão Workload é particularmente valiosa para times pequenos evitarem sobrecarga.
- Filtros ricos e **combináveis (AND)**: workspace, executor, participante, squad, fluxo, tags, situação, data (até hoje / próximos 7-30 dias / vencidas / vence hoje / personalizado), prioridade, estimativa, tipo, criador, canal de origem.
- Filtros salvos e compartilháveis por link.
- Checklist com atribuição de item a pessoa, progresso automático, notificação ao atingir 100%.
- Histórico de auditoria completo (quem mudou o quê e quando) e comentários com @menção, threads e notificações.
- Tarefas recorrentes (ex.: "Sprint Planning Weekly") que se recriam automaticamente com a mesma config.
- Permissões por campo (não só por tela): Admin edita tudo, Editor edita o que criou/está atribuído, Viewer só visualiza; e há campos "não editáveis após criação" (tipo, fluxo).

### Tipos de Tarefa
- Cada tipo tem nome, ícone, cor, e pertence a um fluxo específico — usado para categorizar, filtrar e gerar relatórios ("60% das tarefas são de Design, 40% de Copy").
- Não pode ser deletado se houver tarefas usando o tipo (evita órfãos) — geralmente vira "inativo" em vez de apagado.

### Fluxo de Trabalho
- Motor de máquina de estados: fases ordenadas, SLA por fase, fase(s) final(is), validação de que não se pode pular etapas.
- Interface de edição de fluxo com drag-and-drop para reordenar fases.
- Regra interessante: ao tentar remover uma fase que tem tarefas ativas, o sistema obriga a realocar essas tarefas antes.

### Equipes e Profissionais
- Hierarquia Workspace → Squad → Equipe → Profissional.
- Conceito de **"alocação em fase"** separado de "membro da equipe": define não só quem está no time, mas quem está **habilitado a executar qual etapa do fluxo**, com que % de capacidade e que nível de senioridade — permite roteamento inteligente de tarefas.
- Campo de capacidade (% FTE) por profissional e por alocação, usado para calcular carga de trabalho e sobrecarga.
- Ciclo de vida do profissional: Ativo → Em Licença (férias, afastamento, com datas de início/fim, sem receber novas tarefas mas mantendo as existentes) → Inativo (com reatribuição automática/manual das tarefas ativas) → Deletado (soft, mantém auditoria).
- Skills/tags no profissional, usadas (na visão do material) para recomendação de tarefas e busca de "quem sabe fazer X".

### Usuários e Permissões
- 3 perfis: Admin (acesso total), Editor (executa mas não gerencia usuários/config), Viewer (só leitura, pode comentar em alguns casos).
- Fluxo de convite por e-mail com link expirável (7 dias), estados de convite (Sem convite/Convidado/Pendente/Ativo/Inativo).
- Permissões granulares por workspace (um usuário pode ser Admin num workspace e Viewer noutro).
- Matriz de permissão por campo dentro da tarefa (quem pode editar título, prioridade, etapa, etc.).
- Auditoria: login, IP, mudanças de dados, exportável.

---

## 5. Camada Data-Driven / Relatórios

O módulo Data-Driven é citado no material como "o coração da inteligência operacional" e o mais importante dos 9 módulos para uma operação multi-BU. 4 dashboards centrais:

1. **Gestão de Produtividade** (visão geral da equipe): total de tarefas ativas, quantas vencem hoje/amanhã, quantas estão atrasadas (em destaque vermelho), quebra por urgência (Urgente/Alta/Média/Baixa), tarefas pausadas, novas, tendência dos últimos 7 dias, tabela "tarefas até hoje por executor" para identificar sobrecarga individual.
2. **Atividades por Workspace**: tabela com colunas Novas | Concluídas | Atrasaram | Esforço | Qtd. Peças | Qtd. Forms | Qtd. Publicações — permite comparar performance entre unidades/times (no caso do material, entre as 14 BUs da Kev). Uso sugerido: ordenar por "% atrasadas" para achar o time com problema (>20% = crítico).
3. **Atividades por Executor**: tarefas concluídas/atrasadas por pessoa, etapas em que mais atua, esforço — usado para feedback e 1:1s mensais.
4. **Atividades por Etapa**: tarefas por fase do fluxo com sua taxa de atraso — serve para achar gargalos processuais (ex.: "Review" com 40% de atraso indica falta de revisores ou processo lento).

Padrões operacionais sugeridos no material (rotina semanal): segunda-feira revisão rápida de produtividade geral; quinta-feira revisão por workspace/BU; fim de mês revisão por executor para feedback; identificação de gargalo por etapa quando atrasos persistem. Todos os dashboards têm filtros combináveis (workspace, executor, squad, tags, situação, range de datas) e exportação para Excel/PDF.

---

## 6. O que é valioso para um time de MARKETING INTERNO (vs. o que é "modelo agência")

### Conceitos que fazem sentido para o time interno da Kev Seguros

- **Fluxo de trabalho com fases e SLA por etapa** — mapeia diretamente para um fluxo editorial/produção: Solicitação → Briefing → Produção/Design/Copy → Revisão Jurídica/Compliance → Aprovação → Publicação → Arquivado. É o conceito mais central e mais reaproveitável de todo o sistema.
- **Tipos de tarefa por canal/formato** — Post Social, E-mail Marketing, Peça para Corretor, Banner Site, Vídeo, Material de Campanha, Comunicado Interno, etc. — em vez de "Bug/Feature/Doc" do exemplo genérico.
- **Fluxo de aprovação multi-etapa** (Solicitação → Análise → Aprovação → Implementação → Publicação) é praticamente o desenho nativo de um processo de aprovação de peça de marketing, especialmente relevante numa seguradora onde compliance/jurídico frequentemente precisa aprovar antes de publicar.
- **Checklist dentro da tarefa** com atribuição por item — útil para etapas com múltiplos sub-requisitos (ex.: "peça aprovada por jurídico", "revisão ortográfica feita", "aprovação da BU dona do produto").
- **Visão Workload (carga por pessoa/semana)** — extremamente valiosa para um time pequeno (5-8 pessoas por equipe conforme o próprio material) evitar sobrecarga, sem precisar de billing ou faturamento.
- **Dashboard "Atividades por Workspace"** mapeado para "Atividades por BU" — se cada BU (Seguros Auto, Vida, Residencial etc.) for tratada como um workspace/área, dá visibilidade real de gargalo por unidade de negócio interna, sem qualquer conotação de "cliente externo".
- **Alocação de profissional por etapa/skill** (quem pode fazer Design, quem pode fazer Revisão) — ajuda a rotear tarefas certas para pessoas certas dentro de um time enxuto e multidisciplinar.
- **Relacionamento entre tarefas (bloqueante/bloqueada por)** — útil para campanhas onde a peça de e-mail depende do banner estar pronto, etc.
- **Templates de projeto** (ex. "Marketing Campaign": Strategy → Creative → Copywriting → Approval → Publish) — dá um ponto de partida repetível para campanhas recorrentes (Dia das Mães, IPVA, renovação de apólice, etc.), sem exigir reconstruir o fluxo cada vez.
- **Tarefas recorrentes** — útil para rotinas fixas do time (ex. "post semanal Instagram", "newsletter mensal", "relatório de performance").
- **Histórico/auditoria de mudanças e comentários com @menção** — colaboração básica que qualquer time precisa, independente de ser agência ou interno.

### Conceitos que são "modelo agência multi-cliente" e provavelmente NÃO se aplicam

- **1 Workspace por cliente externo com isolamento total de dados / LGPD entre contas** — a Kev não tem "clientes" no sentido do Ekyte; a segmentação por BU é organizacional, não uma questão de confidencialidade entre partes concorrentes. Isolamento rígido tipo "Cliente A não vê nada do Cliente B" é over-engineering para um time interno.
- **Orçamento e faturamento por projeto** (campo "Orçamento", comparação gasto vs. orçamento) — só faz sentido se o projeto for cobrado de alguém. Um time de marketing interno normalmente não fatura por campanha; o custo relevante é headcount/tempo, não R$ por entrega.
- **Tipo de acesso "Privado" por workspace pensado para sigilo entre contas de clientes concorrentes** — dentro de uma seguradora, times de BUs diferentes provavelmente PRECISAM ver o que as outras BUs estão fazendo (benchmarking interno), o oposto do isolamento total do modelo agência.
- **Duplicação de workspace com opção "copiar usuários/acesso" pensada para replicar setup entre contas de clientes novos** — utilidade limitada; a Kev não vai criar um "workspace novo" a cada cliente que assina contrato.
- **Onboarding de cliente como fluxo de trabalho ("Client Onboarding": Discovery call → Setup account → Training → Go-live)** — é um exemplo do material claramente desenhado para agência atendendo conta nova; não tem equivalente natural no contexto de time interno (a não ser adaptado para onboarding de uma nova BU, o que é raro).
- **Múltiplos workspaces = múltiplas contas de faturamento** (a lógica de upsell/upgrade do Ekyte, "chamado para upgrade bem posicionado") — não é relevante para um sistema interno sem modelo de monetização por conta.
- **Canais e Integrações voltados a notificar cliente externo** — vale manter a ideia de integração com Slack/Teams para notificações internas, mas não o conceito de "canal do cliente".

---

## 7. Recomendação Final — o que priorizar no MVP

**Priorizar (alto valor, baixo custo de implementação):**
- Um único modelo de **Fluxo de Trabalho com fases + SLA por fase**, mapeado ao processo real de aprovação de marketing da Kev (ex.: Backlog → Briefing → Produção → Revisão/Compliance → Aprovação → Publicação → Concluído), com fase(s) final(is) explícitas.
- **Tarefa** como unidade central, com campos essenciais: título, descrição, tipo, responsável único, participantes, prioridade, datas (início/prazo), etapa atual, projeto/campanha (opcional), checklist, anexos, comentários com @menção, histórico de mudanças.
- **Tipos de Tarefa por canal/formato** de marketing (não tipos genéricos de dev).
- **Views essenciais:** Kanban (fluxo do dia a dia) + Lista com filtros combináveis + Workload (carga por pessoa) — são as 3 com melhor relação esforço/valor. Calendário editorial (equivalente à view Calendário) também é fácil de justificar para marketing. Gantt pode ficar para depois (menos crítico em times pequenos e ágeis).
- **Projeto/Campanha** como agrupador simples de tarefas, com progresso automático (% concluído) e data de início/fim — sem orçamento/faturamento.
- **Times/áreas por BU** em vez de "Workspace isolado por cliente": um modelo mais leve (BU como campo/tag em vez de container hermético), preservando a comparação entre BUs no dashboard mas sem duplicar toda a estrutura de permissões por BU.
- **Dashboard "Atividades por BU/Área" + "Atividades por Pessoa" + "Atividades por Etapa"** (os 3 relatórios do Data-Driven mais citados como práticos no material) — dão 80% do valor analítico com esforço razoável. A "Gestão de Produtividade" (visão geral) pode ser a home/dashboard principal do sistema.
- **Dependências simples entre tarefas** (bloqueante/bloqueada por) — útil em campanhas com múltiplas peças interdependentes.
- **Templates de campanha reutilizáveis** para campanhas recorrentes (ex. campanhas sazonais de seguro).
- **Permissões simples de 3 níveis** (Admin / Editor / Viewer), sem a complexidade de permissão granular por campo do Ekyte no MVP.

**Deixar de fora (baixo valor / não se aplica ao contexto interno):**
- Isolamento rígido de dados tipo multi-tenant por "cliente" (workspace hermético com tipo de acesso Privado/Customizado granular).
- Orçamento, faturamento e "gasto vs. orçamento" por projeto.
- Fluxos de onboarding de cliente externo.
- Lógica de upsell/upgrade de plano (não aplicável a sistema interno sem modelo de monetização).
- Duplicação de workspace inteiro como forma de "replicar conta de cliente".
- Multi-workspace complexo — melhor começar com um único espaço de trabalho segmentado por BU/área via tags/filtros, e só evoluir para containers isolados se surgir necessidade real de confidencialidade entre times.
- Recursos avançados de RH dentro do módulo de profissionais (data de admissão/demissão, taxa de custo/hora, cascata de offboarding) — valioso num produto B2B multi-empresa, mas redundante se a Kev já tem um sistema de RH; manter só nome, cargo, skills e capacidade (%).
