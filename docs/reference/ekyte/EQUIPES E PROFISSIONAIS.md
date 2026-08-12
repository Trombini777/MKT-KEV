\# ANÁLISE DETALHADA DO MÓDULO EQUIPES E PROFISSIONAIS \- eKyte

\#\# 1\. DEFINIÇÃO E PROPÓSITO

\*\*O que é Equipes e Profissionais (Teams & Professionals)?\*\*

"Equipes e Profissionais" é um módulo administrativo e organizacional no eKyte que funciona como a \*\*ponte entre alocação de recursos humanos e estrutura operacional\*\*. É um módulo que permite visualizar, gerenciar e entender \*\*quem trabalha onde, em quais equipes, e como os profissionais estão distribuídos nos fluxos de trabalho e etapas de um projeto\*\*.

\*\*Conceito Central:\*\*

Se os módulos anteriores definem \*\*O QUÊ\*\* (Tarefas, Projetos, Workspaces) e \*\*COMO\*\* (Fluxos de Trabalho, Tipos), este módulo define \*\*QUEM\*\* e \*\*ONDE\*\*:  
\- \*\*Equipes\*\*: Agrupamentos de profissionais com objetivo comum  
\- \*\*Profissionais\*\*: Indivíduos com habilidades, responsabilidades e alocações  
\- \*\*Alocação\*\*: Vinculação de profissionais às equipes e etapas de trabalho

\*\*Analogia Conceitual:\*\*

Imagine uma \*\*empresa construtora\*\*:  
\- \*\*Workspaces\*\* \= Diferentes projetos (Prédio A, Prédio B, Prédio C)  
\- \*\*Fluxos de Trabalho\*\* \= Etapas construtivas (Fundação → Estrutura → Acabamento → Entrega)  
\- \*\*Equipes\*\* \= Grupos de trabalho (Pedreiros, Carpinteiros, Eletricistas, Pintores)  
\- \*\*Profissionais\*\* \= Indivíduos (João \- Pedreiro, Maria \- Eletricista, Pedro \- Pintor)  
\- \*\*Alocação\*\* \= Quem trabalha em qual etapa (João na Fundação, Maria na Elétrica, Pedro no Acabamento)

Este módulo mostra exatamente \*\*"Quem é capaz de executar qual fase do trabalho"\*\*.

\*\*Casos de Uso Típicos:\*\*

1\. \*\*Visualização de Capacidade\*\*: "Quantos Eletricistas temos? Quantos estão livres?"  
2\. \*\*Planejamento de Recursos\*\*: "Qual equipe tem disponibilidade para o próximo projeto?"  
3\. \*\*Alocação de Tarefas\*\*: "Quem é responsável pela etapa de QA? Estão sobrecarregados?"  
4\. \*\*Matriz de Habilidades\*\*: "Quem sabe fazer Análise de Dados? Quem pode fazer Code Review?"  
5\. \*\*Organização Hierárquica\*\*: "Qual é a estrutura de Squads? Quem reporta para quem?"  
6\. \*\*Planejamento de Carga\*\*: "Distribuir tarefas de forma balanceada entre profissionais"

\*\*Proposição de Valor:\*\*

O módulo "Equipes e Profissionais" resolve:  
\- ✓ \*\*Falta de visibilidade\*\* sobre recursos disponíveis  
\- ✓ \*\*Desbalanceamento de carga\*\* (uns sobrecarregados, outros ociosos)  
\- ✓ \*\*Falta de planejamento\*\* de alocação  
\- ✓ \*\*Ineficiência\*\* em atribuição de tarefas  
\- ✓ \*\*Dificuldade em identificar\*\* skills/especialidades  
\- ✓ \*\*Ausência de visão\*\* sobre estrutura organizacional

\---

\#\# 2\. ESTRUTURA DA PÁGINA

\*\*URL e Navegação:\*\*

\- \*\*URL\*\*: \`https://app.ekyte.com/\#/admin/team-members\`  
\- \*\*Localização no Menu\*\*: Configurações → Produtividade e Colaboração → Equipes e Profissionais  
\- \*\*Breadcrumb/Título\*\*: "Equipes e Profissionais"  
\- \*\*Ícone\*\*: \[pessoas/equipes icon\]

\*\*Layout Principal:\*\*

\`\`\`  
┌─────────────────────────────────────────────────────────────────────┐  
│  BARRA SUPERIOR (Header da Página)                                  │  
│  Título: "Equipes e Profissionais"                                  │  
│  Ícone: \[groups icon \- múltiplas pessoas\]                           │  
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐  
│  REGIÃO DE FILTROS (Filters Region)                                 │  
│                                                                       │  
│  ┌─────────────────────────────────────────────────────────────┐   │  
│  │ \[Workspace Dropdown\]  Todas          ▼                      │   │  
│  │ Description: Filtrar por workspace específico               │   │  
│  │ Seleção: Single select                                      │   │  
│  └─────────────────────────────────────────────────────────────┘   │  
│                                                                       │  
│  ┌─────────────────────────────────────────────────────────────┐   │  
│  │ \[Squad Dropdown\]      Todos          ▼                      │   │  
│  │ Description: Filtrar por squad específico                   │   │  
│  │ Seleção: Single select                                      │   │  
│  └─────────────────────────────────────────────────────────────┘   │  
│                                                                       │  
│  ┌─────────────────────────────────────────────────────────────┐   │  
│  │ \[Tags\]  Todas tags   ▼                                      │   │  
│  │ Description: Filtrar por tags aplicadas a profissionais     │   │  
│  │ Seleção: Multi-select (checkbox) ou single click            │   │  
│  └─────────────────────────────────────────────────────────────┘   │  
│                                                                       │  
│  ┌─────────────────────────────────────────────────────────────┐   │  
│  │ ☑ Exibir etapas inativas                                   │   │  
│  │ Description: Mostra phases/etapas desativadas (grayedout)  │   │  
│  └─────────────────────────────────────────────────────────────┘   │  
│                                                                       │  
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐  
│  ABAS PRINCIPAIS (Tab Navigation)                                    │  
│                                                                       │  
│  \[FLUXOS DE TRABALHO\] \[TIPOS DE TAREFA\] \[EQUIPES E PROFISSIONAIS\]  │  
│                                              ↑ Currently selected     │  
│                                                                       │  
│  Purpose: Switch between different views of team allocation         │  
│  └─ Fluxos de Trabalho: View by workflow/phases                     │  
│  └─ Tipos de Tarefa: View by task types                             │  
│  └─ Equipes e Profissionais: View by teams & professionals (HERE)  │  
│                                                                       │  
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐  
│  BUSCA (Search Bar)                                                   │  
│                                                                       │  
│  \[🔍 Buscar...\]                                                      │  
│  Full-text search em nomes de equipes, profissionais, skills        │  
│                                                                       │  
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐  
│  CONTEÚDO PRINCIPAL (Main Content Area)                              │  
│                                                                       │  
│  \[ESTADO: Aguardando Seleção\]                                        │  
│                                                                       │  
│  Mensagem: "Para visualização dos dados, selecione um fluxo de      │  
│            trabalho"                                                 │  
│                                                                       │  
│  Ícone: \[documento/pencil icon\]                                      │  
│                                                                       │  
│  Comportamento:                                                      │  
│  ├─ Usuário não selecionou fluxo: mensagem de placeholder           │  
│  ├─ Quando seleciona fluxo: carrega dados/estrutura                │  
│  └─ Mostra matriz de alocação                                        │  
│                                                                       │  
│  Estrutura Esperada (quando carregado):                              │  
│  ├─ COLUNA 1: Nome da Equipe/Profissional (hierarquia)             │  
│  ├─ COLUNAS: Uma por ETAPA/FASE do fluxo selecionado               │  
│  └─ CÉLULAS: Indicadores de alocação/capacidade                    │  
│                                                                       │  
└─────────────────────────────────────────────────────────────────────┘  
\`\`\`

\*\*Componentes Detalhados:\*\*

\`\`\`  
1\. FILTER: Workspace  
   └─ Type: Dropdown (single select)  
   └─ Values: "Todas" (all), \+ list of workspaces  
   └─ Default: "Todas"  
   └─ Behavior: Filtra dados por workspace selecionado  
   └─ Effect: Limita equipes/profissionais mostrados

2\. FILTER: Squad  
   └─ Type: Dropdown (single select)  
   └─ Values: "Todos" (all), \+ list of squads  
   └─ Default: "Todos"  
   └─ Behavior: Filtra por squad específico  
   └─ Effect: Mostra apenas profissionais do squad

3\. FILTER: Tags  
   └─ Type: Multi-select dropdown  
   └─ Values: "Todas" (all) or individual tags  
   └─ Behavior: Click tag \= single selection  
   └─           Click checkbox \= multi-selection  
   └─ Use: Filtrar por skills/competências (tags)  
   └─ Example tags: "JavaScript", "Analysis", "Leadership"

4\. FILTER: Exibir etapas inativas  
   └─ Type: Checkbox  
   └─ Default: UNCHECKED (oculta etapas inativas)  
   └─ When checked: Mostra fases desativadas (grayed)  
   └─ When unchecked: Mostra apenas fases ativas  
   └─ Use: Para visualizar estrutura completa

5\. TABS: Navigation between views  
   └─ \[FLUXOS DE TRABALHO\] → View by workflow  
   └─ \[TIPOS DE TAREFA\] → View by task type  
   └─ \[EQUIPES E PROFISSIONAIS\] → Current tab

6\. SEARCH: Full-text search  
   └─ Placeholder: "Buscar..."  
   └─ Searches: Nomes de equipes, profissionais, habilidades  
   └─ Real-time filtering

7\. MAIN CONTENT: Data Matrix  
   └─ Structure: Rows \= Equipes/Profissionais  
   └─           Columns \= Fases do Fluxo  
   └─ Cells: Mostra alocação (nome, avatar, status)  
   └─ When empty: Shows placeholder message  
\`\`\`

\---

\#\# 3\. HIERARQUIA E RELACIONAMENTOS

\*\*Estrutura de Dados \- Entidades Principais:\*\*

\`\`\`  
┌──────────────────────────────────────────────────────────────────┐  
│                    ENTIDADES PRINCIPAIS                          │  
├──────────────────────────────────────────────────────────────────┤  
│                                                                   │  
│  ┌─ SQUAD (Agrupamento maior de equipes)                         │  
│  │  └─ ID: Numeric unique identifier                             │  
│  │  └─ Nome: Text name (ex: "Product Squad", "Marketing Squad")  │  
│  │  └─ Status: Enum (ACTIVE, INACTIVE)                           │  
│  │  └─ Workspace: Belong to ONE workspace                        │  
│  │                                                                │  
│  │  SQUAD 1: "Product Squad"                                     │  
│  │  ├─ TEAM A: "Backend Team"                                    │  
│  │  │  ├─ Professional 1: João (Backend Developer)              │  
│  │  │  ├─ Professional 2: Ana (DevOps)                          │  
│  │  │  └─ Professional 3: Carlos (QA Engineer)                  │  
│  │  │                                                             │  
│  │  └─ TEAM B: "Frontend Team"                                   │  
│  │     ├─ Professional 4: Maria (React Developer)               │  
│  │     ├─ Professional 5: Pedro (UI/UX Designer)                │  
│  │     └─ Professional 6: Lucas (QA)                            │  
│  │                                                                │  
│  └─ SQUAD 2: "Marketing Squad"                                   │  
│     ├─ TEAM C: "Content Team"                                    │  
│     │  ├─ Professional 7: Sandra (Content Writer)               │  
│     │  └─ Professional 8: Rafael (SEO Specialist)               │  
│     │                                                             │  
│     └─ TEAM D: "Social Media Team"                               │  
│        ├─ Professional 9: Isabela (Social Media Manager)        │  
│        └─ Professional 10: Diego (Community Manager)            │  
│                                                                   │  
├──────────────────────────────────────────────────────────────────┤  
│                                                                   │  
│  ┌─ EQUIPE (Team/Department)                                     │  
│  │  └─ ID: Numeric unique identifier                             │  
│  │  └─ Nome: Text name (ex: "Backend Team", "Design Team")      │  
│  │  └─ Descrição: Optional description of team purpose          │  
│  │  └─ Squad: Belongs to ONE squad (optional)                   │  
│  │  └─ Workspace: Belongs to ONE workspace                      │  
│  │  └─ Manager: User ID of team lead/manager                   │  
│  │  └─ Status: Enum (ACTIVE, INACTIVE)                          │  
│  │  └─ Color: Visual identifier (optional)                      │  
│  │                                                                │  
│  │  Attributes:                                                  │  
│  │  ├─ Tamanho da Equipe: Number of professionals               │  
│  │  ├─ Capacidade Total: Sum of all members' capacity           │  
│  │  ├─ Carga Atual: Current workload                            │  
│  │  └─ Utilização %: Current load / total capacity              │  
│  │                                                                │  
├──────────────────────────────────────────────────────────────────┤  
│                                                                   │  
│  ┌─ PROFISSIONAL (Professional/Team Member)                      │  
│  │  └─ ID: Numeric unique identifier                             │  
│  │  └─ Nome Completo: Full name (ex: "João da Silva")           │  
│  │  └─ Email: Unique email address                              │  
│  │  └─ Foto/Avatar: Profile picture                             │  
│  │  └─ Equipes: Can belong to MULTIPLE teams                    │  
│  │  └─ Skills/Tags: Competências e habilidades                  │  
│  │  └─ Status: Enum (ACTIVE, INACTIVE, ON\_LEAVE)                │  
│  │  └─ Função/Cargo: Job title (ex: "Backend Developer")        │  
│  │  └─ Capacidade: % of time available (100%, 50%, etc)         │  
│  │  └─ Custo/Taxa: Hourly rate or cost unit                     │  
│  │  └─ Data de Admissão: Hire date                              │  
│  │  └─ Data de Saída: Departure date (if applicable)            │  
│  │  └─ Reporta para: Manager ID (supervisor)                    │  
│  │                                                                │  
│  │  Alocações:                                                   │  
│  │  ├─ Alocação em Equipes: Which teams is member of            │  
│  │  ├─ Alocação em Fases: Which workflow phases can do          │  
│  │  ├─ Alocação em Projetos: Assigned projects                 │  
│  │  └─ Alocação em Tarefas: Assigned tasks                      │  
│  │                                                                │  
├──────────────────────────────────────────────────────────────────┤  
│                                                                   │  
│  ┌─ ALOCAÇÃO DE PROFISSIONAL A FASE (Phase Allocation)         │  
│  │  └─ Professional ID: Who                                      │  
│  │  └─ Workflow Phase ID: Which phase/stage                      │  
│  │  └─ Capacidade: % of time available for this phase           │  
│  │  └─ Horas por Semana: Hours/week for this assignment         │  
│  │  └─ Data Início: When allocation starts                      │  
│  │  └─ Data Fim: When allocation ends                           │  
│  │  └─ Nível de Experiência: JUNIOR, SENIOR, LEAD, etc         │  
│  │  └─ Status: ACTIVE, PAUSED, ENDED                            │  
│  │                                                                │  
│  │  Purpose: Define "João pode trabalhar em TESTES (25% time)"  │  
│  │          "Maria pode trabalhar em DESIGN (100% time)"        │  
│  │                                                                │  
└──────────────────────────────────────────────────────────────────┘  
\`\`\`

\*\*Diagrama de Relacionamentos (ERD):\*\*

\`\`\`  
┌─────────────────────────────────────────────────────────────────────┐  
│                    ENTITY RELATIONSHIP DIAGRAM                       │  
├─────────────────────────────────────────────────────────────────────┤  
│                                                                       │  
│  ┌──────────────┐         ┌──────────────┐                          │  
│  │  WORKSPACE   │────────\>│    SQUAD     │                          │  
│  │              │ 1:N     │              │                          │  
│  └──────────────┘         └──────┬───────┘                          │  
│                                   │ 1:N                              │  
│                                   ▼                                  │  
│                          ┌──────────────┐                            │  
│                          │   EQUIPE     │                            │  
│                          │   (Team)     │                            │  
│                          └──────┬───────┘                            │  
│                                   │ N:M                              │  
│         ┌─────────────────────────┴──────────────────┐              │  
│         │                                            │              │  
│         ▼                                            ▼              │  
│  ┌─────────────────────┐              ┌──────────────────────┐     │  
│  │  PROFISSIONAL       │              │  PROFISSIONAL\_EQUIPE │     │  
│  │  (Team Member)      │◄─── M:N ────\>│  (Association)       │     │  
│  │                     │              │                      │     │  
│  │  Attributes:        │              │  \- Profissional\_ID   │     │  
│  │  \- ID               │              │  \- Equipe\_ID         │     │  
│  │  \- Nome             │              │  \- Data\_Admissão     │     │  
│  │  \- Email            │              │  \- Cargo             │     │  
│  │  \- Foto             │              │  \- Status            │     │  
│  │  \- Skills/Tags      │              └──────────────────────┘     │  
│  │  \- Capacidade       │                                            │  
│  │  \- Status           │                                            │  
│  │  \- Reporta para     │                                            │  
│  └──────┬──────────────┘                                            │  
│         │ 1:N                                                       │  
│         │ "Pode executar"                                           │  
│         │                                                            │  
│         ▼                                                            │  
│  ┌───────────────────────┐                                          │  
│  │  PROFISSIONAL\_FASE    │                                          │  
│  │  (Phase Allocation)   │                                          │  
│  │                       │                                          │  
│  │  \- Profissional\_ID    │────┐                                     │  
│  │  \- Fase\_ID            │    │                                     │  
│  │  \- Capacidade %       │    │                                     │  
│  │  \- Experiência        │    │                                     │  
│  │  \- Data\_Início        │    │                                     │  
│  │  \- Data\_Fim           │    │                                     │  
│  │  \- Status             │    │                                     │  
│  └───────────────────────┘    │                                     │  
│         ▲                      │                                     │  
│         │ N:1                  │ 1:N                                │  
│         │ "Alocado a"          │                                    │  
│         │                      ▼                                    │  
│         │            ┌──────────────────┐                           │  
│         └────────────│   WORKFLOW PHASE │                           │  
│                      │   (Etapa/Fase)   │                           │  
│                      │                  │                           │  
│                      │  \- ID            │                           │  
│                      │  \- Nome          │                           │  
│                      │  \- Workflow\_ID   │                           │  
│                      │  \- Ordem         │                           │  
│                      │  \- Status        │                           │  
│                      └──────────────────┘                           │  
│                                                                      │  
└─────────────────────────────────────────────────────────────────────┘

KEY RELATIONSHIPS:  
──────────────────

1\. WORKSPACE : SQUAD \= 1:N (One workspace has many squads)  
2\. SQUAD : EQUIPE \= 1:N (One squad has many teams)  
3\. EQUIPE : PROFISSIONAL \= N:M (Many to many relationship)  
   ├─ Through table: PROFISSIONAL\_EQUIPE  
   └─ Stores: admission date, role, status

4\. PROFISSIONAL : WORKFLOW\_PHASE \= N:M (Many to many)  
   ├─ Through table: PROFISSIONAL\_FASE  
   └─ Stores: capacity, experience level, dates

5\. EQUIPE : MANAGER \= N:1 (Team has one manager)  
   └─ Manager is a PROFISSIONAL

6\. PROFISSIONAL : REPORTA\_PARA \= N:1 (Reports to manager)  
   └─ Reporta\_para is another PROFISSIONAL (self-relationship)  
\`\`\`

\*\*Mapeamento: Equipes e Profissionais ↔ Outros Módulos:\*\*

\`\`\`  
┌────────────────────────────────────────────────────────────────┐  
│  INTEGRAÇÃO: EQUIPES E PROFISSIONAIS ↔ OUTROS MÓDULOS        │  
├────────────────────────────────────────────────────────────────┤  
│                                                                │  
│  1\. EQUIPES ↔ WORKSPACES                                      │  
│     └─ Relação: Equipe pertence a 1 Workspace                │  
│     └─ Impacto: Equipes isoladas por workspace               │  
│     └─ Exemplo: Marketing Team só em WS-Marketing           │  
│                                                                │  
│  2\. EQUIPES ↔ SQUADS                                          │  
│     └─ Relação: Squad contém múltiplas Equipes              │  
│     └─ Impacto: Hierarquia: Squad \> Equipe \> Profissional  │  
│     └─ Exemplo: Product Squad tem Backend Team \+ Frontend   │  
│                                                                │  
│  3\. PROFISSIONAIS ↔ USUÁRIOS                                  │  
│     └─ Relação: Cada Profissional \= Um Usuário (1:1)        │  
│     └─ Impacto: Permissões de usuário vêm de Profissional  │  
│     └─ Dados Sync: Nome, email, foto sincronizados          │  
│                                                                │  
│  4\. PROFISSIONAIS ↔ TAREFAS                                   │  
│     └─ Relação: Tarefa pode ser atribuída a Profissional    │  
│     └─ Impacto: Quem faz a tarefa vem daqui                │  
│     └─ Query: SELECT tarefas WHERE assigned\_to \= prof\_id    │  
│                                                                │  
│  5\. PROFISSIONAIS ↔ WORKFLOW PHASES                          │  
│     └─ Relação: N:M (Profissional pode fazer múltiplas      │  
│               fases; Fase pode ser feita por múltiplos)      │  
│     └─ Impacto: Define "quem pode fazer qual etapa"        │  
│     └─ Capacidade: Cada alocação tem % de disponibilidade  │  
│                                                                │  
│  6\. EQUIPES ↔ TIPOS DE TAREFA                                │  
│     └─ Relação: Equipe especialista em alguns tipos        │  
│     └─ Impacto: Roteamento: qual tipo vai para qual equipe │  
│     └─ Exemplo: QA Team especialista em "Bug Testing"       │  
│                                                                │  
│  7\. PROFISSIONAIS ↔ PROJETOS                                 │  
│     └─ Relação: Profissional alocado a Projeto              │  
│     └─ Impacto: Mostra carga por projeto                    │  
│     └─ Exemplo: João alocado 50% a Projeto A, 50% a Proj B│  
│                                                                │  
│  8\. PROFISSIONAIS ↔ SQUADS (indiretamente via Equipes)      │  
│     └─ Relação: Profissional ∈ Equipe ∈ Squad              │  
│     └─ Impacto: Hierarquia organizacional                   │  
│                                                                │  
│  9\. PROFISSIONAIS ↔ DATA-DRIVEN (Analytics)                 │  
│     └─ Relação: Atividades por Executor (profissional)      │  
│     └─ Impacto: Dashboard "Atividades por Executor"         │  
│     └─ Dados: Quantas tarefas completou, velocidade, etc    │  
│                                                                │  
│ 10\. EQUIPES ↔ CANAIS (Integração)                            │  
│     └─ Relação: Notificações de equipe via canais           │  
│     └─ Impacto: Quando tarefa de equipe muda status → Slack │  
│                                                                │  
└────────────────────────────────────────────────────────────────┘  
\`\`\`

\---

\#\# 4\. FLUXO DE VIDA (LIFECYCLE)

\*\*Estados de Equipes e Profissionais:\*\*

\`\`\`  
┌────────────────────────────────────────────────────────────────┐  
│        LIFECYCLE: EQUIPES E PROFISSIONAIS                      │  
├────────────────────────────────────────────────────────────────┤  
│                                                                │  
│  ═════════════════════════════════════════════════════════════│  
│  CICLO DE VIDA DA EQUIPE (Team Lifecycle)                    │  
│  ═════════════════════════════════════════════════════════════│  
│                                                                │  
│   ┌─────────────────────────────────────────────────────┐    │  
│   │  CRIAÇÃO DE EQUIPE (Creating Team)                  │    │  
│   ├─────────────────────────────────────────────────────┤    │  
│   │ Fluxo:                                              │    │  
│   │ 1\. Admin seleciona "+ Criar Equipe"               │    │  
│   │ 2\. Preenche form:                                  │    │  
│   │    \- Nome da Equipe (obrigatório)                  │    │  
│   │    \- Descrição (opcional)                          │    │  
│   │    \- Squad (seleção)                               │    │  
│   │    \- Manager/Lead (responsável)                    │    │  
│   │    \- Cor (visual identifier)                       │    │  
│   │ 3\. Sistema valida:                                 │    │  
│   │    \- Nome não vazio                                │    │  
│   │    \- Nome único no workspace                       │    │  
│   │    \- Manager existe                                │    │  
│   │    \- Squad válido (se selecionado)                 │    │  
│   │ 4\. Clica "Criar"                                   │    │  
│   │ 5\. Equipe criada com status ATIVA                 │    │  
│   │ 6\. Pode começar a adicionar profissionais         │    │  
│   └─────────────────────────────────────────────────────┘    │  
│                                                                │  
│   ┌─────────────────────────────────────────────────────┐    │  
│   │  ESTADO: ATIVA (Team Active)                        │    │  
│   ├─────────────────────────────────────────────────────┤    │  
│   │ Características:                                    │    │  
│   │ ✓ Equipe operacional                               │    │  
│   │ ✓ Profissionais podem ser adicionados             │    │  
│   │ ✓ Alocações a fases podem ser criadas             │    │  
│   │ ✓ Tarefas podem ser atribuídas à equipe           │    │  
│   │ ✓ Aparece em listas e filtros                      │    │  
│   │ ✓ Visível nos dashboards                           │    │  
│   │                                                    │    │  
│   │ Ações Possíveis:                                   │    │  
│   │ \- Editar informações da equipe                     │    │  
│   │ \- Adicionar/remover profissionais                 │    │  
│   │ \- Atualizar alocações em fases                    │    │  
│   │ \- Desativar equipe                                 │    │  
│   │ \- Deletar (se vazia)                               │    │  
│   │                                                    │    │  
│   └─────────────────────────────────────────────────────┘    │  
│                                                                │  
│   ┌─────────────────────────────────────────────────────┐    │  
│   │  EDIÇÃO DE EQUIPE (Editing Team)                    │    │  
│   ├─────────────────────────────────────────────────────┤    │  
│   │ Campos Editáveis:                                   │    │  
│   │ \- Nome                                              │    │  
│   │ \- Descrição                                         │    │  
│   │ \- Manager/Team Lead                                │    │  
│   │ \- Cor                                               │    │  
│   │ \- Squad                                             │    │  
│   │ \- Status                                            │    │  
│   │                                                    │    │  
│   │ Campos Não Editáveis (Locked):                     │    │  
│   │ \- ID (imutável)                                     │    │  
│   │ \- Data de Criação                                   │    │  
│   │ \- Criado por                                        │    │  
│   │                                                    │    │  
│   │ Fluxo:                                              │    │  
│   │ 1\. Clica "Editar" na equipe                         │    │  
│   │ 2\. Abre form com dados pré-preenchidos            │    │  
│   │ 3\. Modifica campos                                  │    │  
│   │ 4\. Clica "Salvar"                                   │    │  
│   │ 5\. Valida e persiste mudanças                      │    │  
│   │ 6\. Feedback: "Equipe atualizada"                   │    │  
│   │                                                    │    │  
│   └─────────────────────────────────────────────────────┘    │  
│                                                                │  
│   ┌─────────────────────────────────────────────────────┐    │  
│   │  ESTADO: INATIVA (Team Inactive)                    │    │  
│   ├─────────────────────────────────────────────────────┤    │  
│   │ Como Chegar:                                        │    │  
│   │ \- Editar equipe e mudar status para INATIVA        │    │  
│   │                                                    │    │  
│   │ Comportamento:                                      │    │  
│   │ ✗ Profissionais NÃO podem ser adicionados         │    │  
│   │ ✗ Alocações NÃO podem ser criadas                 │    │  
│   │ ✗ Tarefas NÃO podem ser atribuídas                │    │  
│   │ ✓ Histórico permanece intacto                      │    │  
│   │ ✓ Dados permanecem visíveis (leitura)             │    │  
│   │ ✓ Pode ser reativada sem perda                    │    │  
│   │                                                    │    │  
│   │ Reativação:                                         │    │  
│   │ \- Editar e mudar status de volta para ATIVA       │    │  
│   │ \- Sem perda de dados históricos                    │    │  
│   │                                                    │    │  
│   └─────────────────────────────────────────────────────┘    │  
│                                                                │  
│   ┌─────────────────────────────────────────────────────┐    │  
│   │  DELEÇÃO DE EQUIPE (Deleting Team)                 │    │  
│   ├─────────────────────────────────────────────────────┤    │  
│   │ Pré-requisitos:                                     │    │  
│   │ \- Equipe deve estar vazia (sem profissionais)      │    │  
│   │ \- Ou Admin força deleção com cascata               │    │  
│   │                                                    │    │  
│   │ Fluxo:                                              │    │  
│   │ 1\. Clica "Deletar" em equipe                        │    │  
│   │ 2\. Sistema valida:                                  │    │  
│   │    \- Se tem profissionais: pergunta               │    │  
│   │      "Remover profissionais e deletar?"            │    │  
│   │ 3\. Diálogo: "Tem certeza?"                         │    │  
│   │ 4\. Se confirma: deleta equipe                      │    │  
│   │ 5\. Desaparece da lista                             │    │  
│   │                                                    │    │  
│   │ Cascata (opcional):                                 │    │  
│   │ ├─ Se força deleção com profissionais              │    │  
│   │ ├─ Opção 1: Remove profissionais (desfaz vínculo) │    │  
│   │ └─ Opção 2: Move para outra equipe                 │    │  
│   │                                                    │    │  
│   └─────────────────────────────────────────────────────┘    │  
│                                                                │  
│  ═════════════════════════════════════════════════════════════│  
│  CICLO DE VIDA DO PROFISSIONAL (Professional Lifecycle)      │  
│  ═════════════════════════════════════════════════════════════│  
│                                                                │  
│   ┌─────────────────────────────────────────────────────┐    │  
│   │  ADMISSÃO/CONTRATAÇÃO (Hiring)                      │    │  
│   ├─────────────────────────────────────────────────────┤    │  
│   │ Fluxo:                                              │    │  
│   │ 1\. RH ou Admin cria novo Profissional              │    │  
│   │ 2\. Preenche dados:                                  │    │  
│   │    \- Nome completo                                  │    │  
│   │    \- Email                                          │    │  
│   │    \- Cargo/Função                                   │    │  
│   │    \- Foto/Avatar                                    │    │  
│   │    \- Data de Admissão                               │    │  
│   │    \- Capacidade (100%, 50%, etc)                    │    │  
│   │    \- Reporta para (manager)                         │    │  
│   │    \- Skills/Tags                                    │    │  
│   │ 3\. Associa a Equipe(s)                              │    │  
│   │ 4\. Sistema cria:                                    │    │  
│   │    \- User account (email)                           │    │  
│   │    \- Profissional record                            │    │  
│   │    \- Professional\_Equipe relationship               │    │  
│   │ 5\. Envia convite de acesso                          │    │  
│   │                                                    │    │  
│   └─────────────────────────────────────────────────────┘    │  
│                                                                │  
│   ┌─────────────────────────────────────────────────────┐    │  
│   │  ESTADO: ATIVO (Professional Active)                │    │  
│   ├─────────────────────────────────────────────────────┤    │  
│   │ Características:                                    │    │  
│   │ ✓ Pode receber tarefas                             │    │  
│   │ ✓ Pode ser alocado a fases                         │    │  
│   │ ✓ Está visível em listas/dashboards                │    │  
│   │ ✓ Pode logar e usar o sistema                      │    │  
│   │ ✓ Participa de equipes                             │    │  
│   │                                                    │    │  
│   │ Ações Possíveis:                                   │    │  
│   │ \- Atualizar dados pessoais                          │    │  
│   │ \- Adicionar/remover de equipes                     │    │  
│   │ \- Atualizar skills/tags                            │

\# ANÁLISE DETALHADA DO MÓDULO EQUIPES E PROFISSIONAIS \- eKyte  
\#\# (Seções 4-11 \- CONTINUAÇÃO E CONCLUSÃO)

\---

\#\# 4\. FLUXO DE VIDA (LIFECYCLE) \- CONTINUAÇÃO COMPLETA

\*\*Ciclo de Vida do Profissional (Professional Lifecycle) \- Continuação:\*\*

\`\`\`  
│   ┌─────────────────────────────────────────────────────┐    │  
│   │  ESTADO: ATIVO (Professional Active) \- CONTINUAÇÃO   │    │  
│   ├─────────────────────────────────────────────────────┤    │  
│   │ Ações Durante Estado ATIVO:                          │    │  
│   │                                                    │    │  
│   │ 1\. ADICIONAR/REMOVER DE EQUIPES                     │    │  
│   │    └─ Fluxo:                                         │    │  
│   │       ├─ Admin clica "+ Adicionar à Equipe"        │    │  
│   │       ├─ Seleciona Equipe(s)                        │    │  
│   │       ├─ Define Cargo/Função                        │    │  
│   │       ├─ Define Data de Admissão                    │    │  
│   │       ├─ Clica "Confirmar"                          │    │  
│   │       └─ Vínculo criado: Profissional\_Equipe       │    │  
│   │                                                    │    │  
│   │    └─ Remover de Equipe:                            │    │  
│   │       ├─ Clica "X" ou "Remover"                     │    │  
│   │       ├─ Confirmação: "Remover de Marketing Team?"  │    │  
│   │       ├─ Abre opções:                               │    │  
│   │       │  ├─ \[Remover\] (desfaz vínculo apenas)      │    │  
│   │       │  ├─ \[Desativar\] (mantém histórico)         │    │  
│   │       │  └─ \[Dados de Saída\] (completar)           │    │  
│   │       └─ Desvincula do registro Profissional\_Equipe│    │  
│   │                                                    │    │  
│   │ 2\. ATUALIZAR ALOCAÇÃO EM FASES                      │    │  
│   │    └─ Fluxo:                                         │    │  
│   │       ├─ Admin clica "Alocar a Fase"               │    │  
│   │       ├─ Seleciona Workflow Phase                   │    │  
│   │       ├─ Define Capacidade (% de tempo)             │    │  
│   │       ├─ Define Nível de Experiência               │    │  
│   │       ├─ Define Datas (início/fim)                  │    │  
│   │       ├─ Clica "Confirmar"                          │    │  
│   │       └─ Registro Profissional\_Fase criado          │    │  
│   │                                                    │    │  
│   │ 3\. ATUALIZAR SKILLS/TAGS                            │    │  
│   │    └─ Admin pode adicionar/remover skills           │    │  
│   │    └─ Exemplo: "JavaScript", "React", "Leadership" │    │  
│   │    └─ Afeta: Recomendações de tarefas               │    │  
│   │                                                    │    │  
│   │ 4\. ATUALIZAR DADOS PESSOAIS                         │    │  
│   │    └─ Nome, Foto, Cargo, Manager, Capacidade       │    │  
│   │    └─ Email mudança \= atualiza usuário também       │    │  
│   │                                                    │    │  
│   │ 5\. VISUALIZAR CARGA DE TRABALHO                     │    │  
│   │    └─ Dashboard mostra:                             │    │  
│   │       ├─ Tarefas atribuídas (ativas)                │    │  
│   │       ├─ Capacidade disponível                      │    │  
│   │       ├─ Projetos alocados                          │    │  
│   │       └─ Histórico de atividades                    │    │  
│   │                                                    │    │  
│   └─────────────────────────────────────────────────────┘    │  
│                                                                │  
│   ┌─────────────────────────────────────────────────────┐    │  
│   │  ESTADO: EM LICENÇA (Professional On Leave)         │    │  
│   ├─────────────────────────────────────────────────────┤    │  
│   │ Como Chegar:                                        │    │  
│   │ \- Edit Profissional \> Status \= "ON\_LEAVE"          │    │  
│   │ \- Defina data de início e fim                       │    │  
│   │                                                    │    │  
│   │ Comportamento:                                      │    │  
│   │ ✗ NÃO pode receber novas tarefas                    │    │  
│   │ ✗ NÃO aparece em dropdowns de responsáveis         │    │  
│   │ ✓ Tarefas existentes permanecem atribuídas         │    │  
│   │ ✓ Pode voltar do licença (reativar)                │    │  
│   │ ✓ Histórico preservado                              │    │  
│   │                                                    │    │  
│   │ Casos de Uso:                                       │    │  
│   │ \- Férias, maternidade, sabático                    │    │  
│   │ \- Afastamento médico                                │    │  
│   │ \- Projetos especiais fora da empresa                │    │  
│   │                                                    │    │  
│   └─────────────────────────────────────────────────────┘    │  
│                                                                │  
│   ┌─────────────────────────────────────────────────────┐    │  
│   │  ESTADO: INATIVO (Professional Inactive)            │    │  
│   ├─────────────────────────────────────────────────────┤    │  
│   │ Como Chegar:                                        │    │  
│   │ \- Edit Profissional \> Status \= "INACTIVE"          │    │  
│   │ \- Defina Data de Saída (opcional)                  │    │  
│   │                                                    │    │  
│   │ Comportamento:                                      │    │  
│   │ ✗ NÃO pode logar no sistema                         │    │  
│   │ ✗ NÃO pode receber tarefas                          │    │  
│   │ ✗ NÃO aparece em listas de usuários                │    │  
│   │ ✓ Histórico de dados permanece intacto             │    │  
│   │ ✓ Relatórios/analytics mostram histórico            │    │  
│   │ ✓ Pode ser reativado (se erro)                     │    │  
│   │                                                    │    │  
│   │ Cascata de Inativação:                              │    │  
│   │ 1\. Desvincula de todas as equipes (soft)            │    │  
│   │ 2\. Marca alocações em fases como "ENDED"            │    │  
│   │ 3\. Reatribui tarefas ativas para outro              │    │  
│   │ 4\. Desativa user account (login bloqueado)          │    │  
│   │ 5\. Mantém histórico completo                        │    │  
│   │                                                    │    │  
│   └─────────────────────────────────────────────────────┘    │  
│                                                                │  
│   ┌─────────────────────────────────────────────────────┐    │  
│   │  DEMISSÃO / SAÍDA (Professional Departure)          │    │  
│   ├─────────────────────────────────────────────────────┤    │  
│   │ Processo Administrativo:                            │    │  
│   │ 1\. RH/Admin defina Data de Saída                   │    │  
│   │ 2\. Gera relatório final:                            │    │  
│   │    \- Tarefas completadas                            │    │  
│   │    \- Projetos participados                          │    │  
│   │    \- Desempenho/contribuição                        │    │  
│   │ 3\. Offboarding automático:                          │    │  
│   │    \- Reatribui tarefas ativas                       │    │  
│   │    \- Desvincula de equipes                          │    │  
│   │    \- Finaliza alocações em fases                    │    │  
│   │    \- Desativa permissões de acesso                  │    │  
│   │ 4\. Arquiva perfil profissional                      │    │  
│   │ 5\. Mantém dados para auditoria (2 anos)             │    │  
│   │                                                    │    │  
│   │ Reatribuição de Tarefas:                            │    │  
│   │ \- Sistema oferece opções:                           │    │  
│   │   ├─ Atribuir para Manager (automático)             │    │  
│   │   ├─ Atribuir para Colega de Equipe                │    │  
│   │   └─ Deixar em aberto (manual depois)               │    │  
│   │                                                    │    │  
│   └─────────────────────────────────────────────────────┘    │  
│                                                                │  
│   ┌─────────────────────────────────────────────────────┐    │  
│   │  DIAGRAMA: TRANSIÇÃO DE ESTADOS                     │    │  
│   ├─────────────────────────────────────────────────────┤    │  
│   │                                                    │    │  
│   │  ┌──────────────┐                                  │    │  
│   │  │   CRIANDO    │                                  │    │  
│   │  │  (Creating)  │                                  │    │  
│   │  └──────┬───────┘                                  │    │  
│   │         │ Validação OK                             │    │  
│   │         ▼                                           │    │  
│   │  ┌──────────────────────────────────┐             │    │  
│   │  │         ATIVO                    │             │    │  
│   │  │  (Active \- Operational)          │             │    │  
│   │  │                                  │             │    │  
│   │  │  ◄─────────────┐                │             │    │  
│   │  │                │ Volta de Licença│             │    │  
│   │  └────┬───────────┘                │             │    │  
│   │       │ Solicitar Licença           │             │    │  
│   │       ▼                              │             │    │  
│   │  ┌──────────────────────────────────┐             │    │  
│   │  │     EM LICENÇA                   │             │    │  
│   │  │  (On Leave/Sabbatical)           │             │    │  
│   │  │                                  │             │    │  
│   │  │  Data Fim ─────────────────────┐ │             │    │  
│   │  └──────────────────────────────────┘ │             │    │  
│   │       │                                │ ▲          │    │  
│   │       │ Encerrar Licença               │ │          │    │  
│   │       └────────────────────────────────┘ │          │    │  
│   │                                          │          │    │  
│   │  ┌──────────────────────────────────┐   │          │    │  
│   │  │      INATIVO                     │   │          │    │  
│   │  │  (Inactive/Archived)             │   │          │    │  
│   │  │                                  │   │          │    │  
│   │  │  (Demitido ou Desativado)        │◄──┘          │    │  
│   │  └──────────────────────────────────┘             │    │  
│   │       │                                            │    │  
│   │       │ Deletar (se necessário)                   │    │  
│   │       ▼                                            │    │  
│   │  ┌──────────────┐                                 │    │  
│   │  │  DELETADO    │                                 │    │  
│   │  │  (Deleted)   │                                 │    │  
│   │  └──────────────┘                                 │    │  
│   │                                                    │    │  
│   └─────────────────────────────────────────────────────┘    │  
│                                                                │  
└────────────────────────────────────────────────────────────────┘  
\`\`\`

\---

\#\# 5\. CAMPOS DO FORMULÁRIO DETALHADOS

\*\*Formulário de Criação/Edição de Equipe:\*\*

\`\`\`  
┌────────────────────────────────────────────────────────────────┐  
│    FORMULÁRIO: Criar / Editar Equipe                           │  
├────────────────────────────────────────────────────────────────┤  
│                                                                │  
│ ╔═ CAMPO 1: NOME DA EQUIPE ══════════════════════════════════╗│  
│ ║                                                            ║│  
│ ║ Label: "Nome da Equipe" ou "Team Name"                   ║│  
│ ║ Tipo: Text Input (single line)                            ║│  
│ ║ Placeholder: "Ex: Backend Team, Design Team, QA Team"    ║│  
│ ║ Obrigatório: SIM (required field)                         ║│  
│ ║ Tamanho Máximo: 100 caracteres                            ║│  
│ ║ Validação:                                                ║│  
│ ║   • Não vazio                                             ║│  
│ ║   • Comprimento: Min 3, Max 100                           ║│  
│ ║   • Único no workspace (não pode duplicar)                ║│  
│ ║   • Caracteres especiais: \-\_. são permitidos              ║│  
│ ║ Erro Padrão:                                              ║│  
│ ║   • "Nome da equipe é obrigatório"                        ║│  
│ ║   • "Nome deve ter min 3 caracteres"                      ║│  
│ ║   • "Uma equipe com este nome já existe"                  ║│  
│ ║ Valor Default: Vazio (criar) / Nome atual (edit)          ║│  
│ ║ Help Text: "Nome descritivo da equipe (ex: Backend)"      ║│  
│ ║                                                            ║│  
│ ╚════════════════════════════════════════════════════════════╝│  
│                                                                │  
│ ╔═ CAMPO 2: DESCRIÇÃO ═══════════════════════════════════════╗│  
│ ║                                                            ║│  
│ ║ Label: "Descrição" ou "Team Description"                 ║│  
│ ║ Tipo: Textarea (multi-line text)                          ║│  
│ ║ Placeholder: "Descrição do propósito/foco da equipe"     ║│  
│ ║ Obrigatório: NÃO (opcional)                               ║│  
│ ║ Tamanho Máximo: 500 caracteres                            ║│  
│ ║ Validação:                                                ║│  
│ ║   • Se preenchido: comprimento \< 500                      ║│  
│ ║ Valor Default: Vazio                                      ║│  
│ ║ Help Text: "Descreva o foco/propósito desta equipe"      ║│  
│ ║                                                            ║│  
│ ║ Exemplo:                                                  ║│  
│ ║   "Responsável pelo desenvolvimento de APIs REST e        ║│  
│ ║    arquitetura de microserviços. Foco em performance e    ║│  
│ ║    escalabilidade."                                        ║│  
│ ║                                                            ║│  
│ ╚════════════════════════════════════════════════════════════╝│  
│                                                                │  
│ ╔═ CAMPO 3: SQUAD ══════════════════════════════════════════╗│  
│ ║                                                            ║│  
│ ║ Label: "Squad" ou "Agrupamento de Nível Superior"         ║│  
│ ║ Tipo: Dropdown / Single Select (searchable)                ║│  
│ ║ Obrigatório: NÃO (opcional)                               ║│  
│ ║ Dados: Lista de Squads do workspace                        ║│  
│ ║ Validação:                                                ║│  
│ ║   • Se preenchido: Squad existe e é ativo                 ║│  
│ ║ Valor Default: Vazio/None                                 ║│  
│ ║ Comportamento:                                            ║│  
│ ║   • Opcional: equipe pode não pertencer a squad           ║│  
│ ║   • Single select: apenas um squad por equipe             ║│  
│ ║   • Searchable: pode digitar para filtrar                 ║│  
│ ║ Impacto:                                                  ║│  
│ ║   • Define hierarquia: Squad \> Equipe \> Profissional     ║│  
│ ║   • Afeta visibilidade/organização                        ║│  
│ ║   • Filtro "Equipes por Squad" funciona aqui              ║│  
│ ║                                                            ║│  
│ ║ Exemplo:                                                  ║│  
│ ║   Product Squad                                           ║│  
│ ║   Marketing Squad                                         ║│  
│ ║   Operations Squad                                        ║│  
│ ║                                                            ║│  
│ ╚════════════════════════════════════════════════════════════╝│  
│                                                                │  
│ ╔═ CAMPO 4: GERENCIADOR / LÍDER DA EQUIPE ══════════════════╗│  
│ ║                                                            ║║  
│ ║ Label: "Gerenciador", "Team Lead", "Responsável"         ║│  
│ ║ Tipo: Dropdown / Searchable Select                        ║│  
│ ║ Obrigatório: SIM (required \- someone must lead)           ║│  
│ ║ Dados: Lista de Profissionais ativos do workspace         ║│  
│ ║ Validação:                                                ║│  
│ ║   • Profissional selecionado existe                       ║│  
│ ║   • Profissional é ATIVO (não pode ser inativo)           ║│  
│ ║   • Deve estar no workspace                               ║│  
│ ║ Valor Default:                                            ║│  
│ ║   • Criação: Usuário logado (se é profissional)          ║│  
│ ║   • Edição: Manager atual                                 ║│  
│ ║ Comportamento:                                            ║│  
│ ║   • Searchable: digita para filtrar                       ║│  
│ ║   • Mostra foto \+ nome                                    ║│  
│ ║   • Pode ser mudado em edição                             ║│  
│ ║ Impacto:                                                  ║│  
│ ║   • Define responsável pela equipe                        ║│  
│ ║   • Manager pode gerenciar equipe (criar/editar membros) ║│  
│ ║   • Reportes vão para este gerenciador                    ║│  
│ ║   • Escalações de problemas vão para manager              ║│  
│ ║                                                            ║│  
│ ╚════════════════════════════════════════════════════════════╝│  
│                                                                │  
│ ╔═ CAMPO 5: COR / IDENTIFICADOR VISUAL ═════════════════════╗│  
│ ║                                                            ║│  
│ ║ Label: "Cor" ou "Visual Identifier"                       ║│  
│ ║ Tipo: Color Picker (dropdown com cores predefinidas)      ║│  
│ ║ Obrigatório: NÃO (opcional, default \= cyan/blue)          ║│  
│ ║ Valores: 8-12 cores pré-definidas                         ║│  
│ ║   • Azul (default)                                        ║│  
│ ║   • Vermelho                                              ║│  
│ ║   • Verde                                                 ║│  
│ ║   • Laranja                                               ║│  
│ ║   • Roxo                                                  ║│  
│ ║   • Rosa                                                  ║│  
│ ║   • Amarelo                                               ║│  
│ ║   • Cinza                                                 ║│  
│ ║ Impacto:                                                  ║│  
│ ║   • Visualização: cards/badges da equipe                 ║│  
│ ║   • Identificação rápida em dashboards                    ║│  
│ ║   • Kanban boards mostram cor da equipe                  ║│  
│ ║   • Relatórios usam cor para diferenciar                 ║│  
│ ║                                                            ║│  
│ ║ Dica: Use cores para separar viualmente                   ║│  
│ ║       (ex: Backend=Azul, Frontend=Verde, QA=Vermelho)     ║│  
│ ║                                                            ║│  
│ ╚════════════════════════════════════════════════════════════╝│  
│                                                                │  
│ ╔═ CAMPO 6: STATUS ═════════════════════════════════════════╗│  
│ ║                                                            ║│  
│ ║ Label: "Status" ou "Estado"                               ║│  
│ ║ Tipo: Radio Buttons ou Toggle / Binary Select             ║│  
│ ║ Obrigatório: SIM (required)                               ║│  
│ ║ Valores:                                                  ║│  
│ ║   • ⚪ "Ativa" / "Active"                                 ║│  
│ ║   • ⭕ "Inativa" / "Inactive"                             ║│  
│ ║ Validação:                                                ║│  
│ ║   • Status é um dos valores permitidos                    ║│  
│ ║ Valor Default: "Ativa" (ativo por padrão)                ║│  
│ ║ Comportamento:                                            ║│  
│ ║   • Radio buttons ou toggle switch                        ║│  
│ ║   • Mudança imediata em tempo real                        ║│  
│ ║   • Confirmação se muda para INATIVA                      ║│  
│ ║ Impacto de Desativação:                                   ║│  
│ ║   • Novos membros NÃO podem ser adicionados               ║│  
│ ║   • Equipe não aparece em filtros (opcional)             ║│  
│ ║   • Histórico permaneça intacto                           ║│  
│ ║   • Pode ser reativada                                    ║│  
│ ║                                                            ║│  
│ ╚════════════════════════════════════════════════════════════╝│  
│                                                                │  
│  BOTÕES DE AÇÃO:                                             │  
│  ┌────────────────────────┐  ┌─────────────────────┐        │  
│  │  \[💾 Salvar\]           │  │  \[✕ Cancelar\]       │        │  
│  │ (Save/Create team)     │  │ (Discard & close)   │        │  
│  └────────────────────────┘  └─────────────────────┘        │  
│                                                                │  
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐  
│    FORMULÁRIO: Criar / Editar Profissional                     │  
├────────────────────────────────────────────────────────────────┤  
│                                                                │  
│ ╔═ CAMPO 1: NOME COMPLETO ════════════════════════════════════╗│  
│ ║                                                            ║│  
│ ║ Label: "Nome Completo" ou "Full Name"                    ║│  
│ ║ Tipo: Text Input                                          ║│  
│ ║ Placeholder: "Ex: João da Silva"                          ║│  
│ ║ Obrigatório: SIM                                          ║│  
│ ║ Tamanho Máximo: 150 caracteres                            ║│  
│ ║ Validação: Não vazio, min 3 chars                         ║│  
│ ║                                                            ║│  
│ ╚════════════════════════════════════════════════════════════╝│  
│                                                                │  
│ ╔═ CAMPO 2: EMAIL ════════════════════════════════════════════╗│  
│ ║                                                            ║│  
│ ║ Label: "Email" ou "E-mail"                                ║│  
│ ║ Tipo: Email Input (type="email")                          ║│  
│ ║ Placeholder: "joao@empresa.com"                           ║│  
│ ║ Obrigatório: SIM                                          ║│  
│ ║ Validação:                                                ║│  
│ ║   • Formato de email válido                               ║│  
│ ║   • Único (não pode duplicar email)                       ║│  
│ ║ Impacto:                                                  ║│  
│ ║   • Cria/atualiza User account                            ║│  
│ ║   • Email para login e notificações                       ║│  
│ ║   • Mudança de email \= mudança de user                    ║│  
│ ║                                                            ║│  
│ ║ ALERTA: Mudar email tem impacto em permissões/acesso     ║│  
│ ║                                                            ║│  
│ ╚════════════════════════════════════════════════════════════╝│  
│                                                                │  
│ ╔═ CAMPO 3: CARGO / FUNÇÃO ═════════════════════════════════╗│  
│ ║                                                            ║│  
│ ║ Label: "Cargo", "Função", "Job Title"                    ║│  
│ ║ Tipo: Text Input ou Dropdown (job titles predefinidos)   ║│  
│ ║ Placeholder: "Ex: Backend Developer, QA Engineer"         ║│  
│ ║ Obrigatório: SIM                                          ║│  
│ ║ Tamanho Máximo: 100 caracteres                            ║│  
│ ║ Exemplos de Cargos:                                       ║│  
│ ║   • Backend Developer                                    ║│  
│ ║   • Frontend Developer                                   ║│  
│ ║   • QA Engineer                                           ║│  
│ ║   • Product Manager                                      ║│  
│ ║   • Designer                                              ║│  
│ ║   • Project Manager                                      ║│  
│ ║                                                            ║│  
│ ╚════════════════════════════════════════════════════════════╝│  
│                                                                │  
│ ╔═ CAMPO 4: FOTO / AVATAR ══════════════════════════════════╗│  
│ ║                                                            ║│  
│ ║ Label: "Foto de Perfil", "Avatar", "Profile Picture"     ║│  
│ ║ Tipo: File Upload (image)                                 ║│  
│ ║ Obrigatório: NÃO (gerará avatar padrão se vazio)         ║│  
│ ║ Formatos Aceitos: JPG, PNG, GIF (max 2MB)                 ║│  
│ ║ Comportamento:                                            ║│  
│ ║   • Clica para fazer upload                               ║│  
│ ║   • Mostra preview da imagem                              ║│  
│ ║   • Opção "Remover foto"                                  ║│  
│ ║ Default: Avatar auto-gerado (iniciais \+ cor)              ║│  
│ ║                                                            ║│  
│ ╚════════════════════════════════════════════════════════════╝│  
│                                                                │  
│ ╔═ CAMPO 5: DATA DE ADMISSÃO ═══════════════════════════════╗│  
│ ║                                                            ║│  
│ ║ Label: "Data de Admissão", "Hire Date"                   ║│  
│ ║ Tipo: Date Picker (DD/MM/YYYY)                            ║│  
│ ║ Obrigatório: SIM                                          ║│  
│ ║ Validação:                                                ║│  
│ ║   • Data válida                                           ║│  
│ ║   • Não pode ser futura (não pode admitir antes de hoje) ║│  
│ ║ Valor Default: Hoje                                       ║│  
│ ║ Impacto:                                                  ║│  
│ ║   • Define data de início na empresa                      ║│  
│ ║   • Usado em relatórios/seniority                         ║│  
│ ║   • Afeta cálculo de experiência                          ║│  
│ ║                                                            ║│  
│ ╚════════════════════════════════════════════════════════════╝│  
│                                                                │  
│ ╔═ CAMPO 6: CAPACIDADE ════════════════════════════════════╗│  
│ ║                                                            ║║  
│ ║ Label: "Capacidade", "Disponibilidade", "FTE"             ║│  
│ ║ Tipo: Select / Number Input (percentage)                  ║│  
│ ║ Obrigatório: SIM                                          ║│  
│ ║ Valores Típicos:                                          ║│  
│ ║   • 100% (full-time, dedicado)                            ║│  
│ ║   • 75%                                                   ║│  
│ ║   • 50% (part-time, compartilhado)                        ║│  
│ ║   • 25%                                                   ║│  
│ ║ Validação: Entre 1 e 100                                  ║│  
│ ║ Impacto:                                                  ║│  
│ ║   • Define disponibilidade de tempo                       ║│  
│ ║   • Afeta cálculo de carga de trabalho                    ║│  
│ ║   • 100% pode fazer 40h/semana                            ║│  
│ ║   • 50% pode fazer 20h/semana                             ║│  
│ ║   • Sistema avisa se sobrecarregado (\>100%)               ║│  
│ ║                                                            ║│  
│ ║ Exemplo:                                                  ║│  
│ ║   João: 100% (full-time)                                  ║│  
│ ║   Maria: 50% (divide tempo entre 2 equipes)              ║│  
│ ║   Pedro: 75% (mostly full, mas reserve 25% para POC)     ║│  
│ ║                                                            ║│  
│ ╚════════════════════════════════════════════════════════════╝│  
│                                                                │  
│ ╔═ CAMPO 7: REPORTA PARA / MANAGER ═════════════════════════╗│  
│ ║                                                            ║│  
│ ║ Label: "Reporta para", "Manager", "Supervisor"           ║│  
│ ║ Tipo: Dropdown / Searchable Select                        ║│  
│ ║ Obrigatório: NÃO (opcional, mas recomendado)             ║│  
│ ║ Dados: Outros Profissionais (não self)                    ║│  
│ ║ Validação:                                                ║│  
│ ║   • Se preenchido: profissional existe                    ║│  
│ ║   • Não pode reportar para si mesmo                       ║│  
│ ║   • Evita ciclos (A→B→C→A)                               ║│  
│ ║ Impacto:                                                  ║│  
│ ║   • Define hierarquia organizacional                      ║│  
│ ║   • Escalação de problemas                                ║│  
│ ║   • Aprovações de tempo/folga                             ║│  
│ ║   • Relatórios de desempenho                              ║│  
│ ║                                                            ║│  
│ ╚════════════════════════════════════════════════════════════╝│  
│                                                                │  
│ ╔═ CAMPO 8: SKILLS / TAGS ════════════════════════════════════╗│  
│ ║                                                            ║│  
│ ║ Label: "Skills", "Competências", "Tags"                  ║│  
│ ║ Tipo: Multi-Select Dropdown / Tag Input                   ║│  
│ ║ Obrigatório: NÃO (opcional)                               ║│  
│ ║ Dados: Lista de tags predefinidas \+ criar novo            ║│  
│ ║ Comportamento:                                            ║│  
│ ║   • Multi-select: múltiplas skills                        ║│  
│ ║   • Autocomplete: digita para filtrar                     ║│  
│ ║   • Create inline: cria nova skill se não existe          ║│  
│ ║   • Mostra como chips/pills                               ║│  
│ ║ Exemplos de Skills:                                       ║│  
│ ║   • JavaScript, React, Node.js, TypeScript                ║│  
│ ║   • Python, Django, Machine Learning                      ║│  
│ ║   • Figma, UI Design, Wireframing                         ║│  
│ ║   • Leadership, Mentoring, Communication                  ║│  
│ ║ Impacto:                                                  ║│  
│ ║   • Define habilidades/especialidades                     ║│  
│ ║   • Usado para recomendação de tarefas                    ║│  
│ ║   • Filtragem de profissionais por skill                  ║│  
│ ║   • Planejamento de equipes/recursos                      ║│  
│ ║                                                            ║│  
│ ╚════════════════════════════════════════════════════════════╝│  
│                                                                │  
│ ╔═ CAMPO 9: STATUS ═════════════════════════════════════════╗│  
│ ║                                                            ║│  
│ ║ Label: "Status"                                           ║│  
│ ║ Tipo: Select / Radio Buttons                              ║│  
│ ║ Obrigatório: SIM                                          ║│  
│ ║ Valores:                                                  ║│  
│ ║   • ⚪ ATIVO (Active)                                     ║│  
│ ║   • ⏸ EM LICENÇA (On Leave)                              ║│  
│ ║   • ⭕ INATIVO (Inactive)                                 ║│  
│ ║ Validação: Status é um dos valores permitidos             ║│  
│ ║ Valor Default: "ATIVO"                                    ║│  
│ ║ Comportamento:                                            ║│  
│ ║   • Se EM LICENÇA: oferece campos de data (início/fim)   ║│  
│ ║   • Se INATIVO: oferece campo "Data de Saída"            ║│  
│ ║                                                            ║│  
│ ╚════════════════════════════════════════════════════════════╝│  
│                                                                │  
│ ╔═ CAMPO 10: EQUIPES ════════════════════════════════════════╗│  
│ ║                                                            ║│  
│ ║ Label: "Equipes" ou "Team Assignments"                   ║│  
│ ║ Tipo: Multi-Select (Profissional pode estar em N equipes)║║  
│ ║ Obrigatório: NÃO (pode criar profissional sem equipe)    ║│  
│ ║ Dados: Lista de equipes ativas do workspace               ║│  
│ ║ Comportamento:                                            ║│  
│ ║   • Checkbox para cada equipe                             ║│  
│ ║   • Selecione múltiplas                                   ║│  
│ ║   • Para cada: opção de definir Cargo/Função             ║│  
│ ║   • Data de admissão à equipe pode ser diferente         ║│  
│ ║ Impacto:                                                  ║│  
│ ║   • Define que equipes profissional pertence              ║│  
│ ║   • Exemplo: João ∈ Backend Team \+ DevOps Team           ║│  
│ ║   • Afeta "Profissionais por Equipe"                     ║│  
│ ║                                                            ║│  
