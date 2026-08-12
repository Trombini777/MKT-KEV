\# ANÁLISE DETALHADA DO MÓDULO WORKSPACES \- eKyte

\#\# 1\. DEFINIÇÃO E PROPÓSITO

\*\*O que é Workspaces?\*\*

Workspaces (Espaços de Trabalho) é um módulo administrativo no eKyte que funciona como container organizacional para separar, isolar e gerenciar ambientes de trabalho distintos dentro de uma mesma empresa ou organização. Diferente de "Tarefas" que representa trabalho a executar, ou "Projetos" que agrupa atividades relacionadas, um Workspace é uma dimensão organizacional que atua como um "silos de operação" \- cada workspace opera como um ambiente separado com sua própria configuração, usuários, equipes, projetos e fluxos de trabalho.

\*\*Analogia Conceitual:\*\*

Se a eKyte fosse um prédio corporativo, cada \*\*Projeto\*\* seria um departamento (Vendas, Marketing, RH), cada \*\*Tarefa\*\* seria um documento específico a processar, mas um \*\*Workspace\*\* seria um \*\*andar inteiro do prédio\*\*, com suas próprias paredes, portas, segurança, e regras operacionais. Múltiplos andares (workspaces) podem coexistir no mesmo prédio (empresa), com usuários diferentes, equipes diferentes, e até diferentes processos de trabalho (fluxos de trabalho).

\*\*Casos de Uso Típicos:\*\*

\- Uma agência de marketing com múltiplos clientes pode criar um Workspace por cliente, isolando completamente o trabalho de cada um  
\- Uma empresa com múltiplas unidades de negócio (regional, divisional) pode ter um Workspace por unidade  
\- Uma organização com diferentes departamentos operacionais (Operações, Marketing, Vendas) pode separar cada um em seu próprio Workspace  
\- Uma empresa em fase de crescimento pode ter Workspaces de "Teste/Desenvolvimento", "Staging" e "Produção"  
\- Agências com vários times/squads podem usar Workspaces para separar trabalho por squad ou departamento

\*\*Proposição de Valor:\*\*

O módulo Workspaces resolve o problema de \*\*segregação organizacional e governança de dados\*\*. Permite que grandes estruturas organizacionais mantenham a plataforma unificada (uma única instância eKyte) mas operando com múltiplos ambientes isolados com regras, usuários, e configurações diferentes \- oferecendo segurança de dados, conformidade, e clareza organizacional.

\---

\#\# 2\. ESTRUTURA DA PÁGINA

\*\*URL e Navegação:\*\*

\- URL: \`https://app.ekyte.com/\#/admin/workspaces\`  
\- Localização no Menu: Configurações → Produtividade e Colaboração → Workspaces  
\- Breadcrumb/Título: "Cadastro de Workspaces" (Workspace Registration/Management)

\*\*Layout Principal:\*\*

\`\`\`  
┌─────────────────────────────────────────────────────────────────────┐  
│  BARRA SUPERIOR (Header da Página)                                  │  
│  Título: "Cadastro de Workspaces"                                   │  
│  Ícone: \[grid-like icon for workspaces\]                             │  
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐  
│  REGIÃO DE FILTROS (Filters Region)                                 │  
│                                                                       │  
│  ┌─────────────────────────────────────────────────────────────┐   │  
│  │ \[Tags Dropdown\]  Todas tags          ▼                      │   │  
│  │ Description: Filtrar por tags aplicadas aos workspaces     │   │  
│  │ Seleção: Multi-seleção (checkbox) ou seleção única (click)│   │  
│  └─────────────────────────────────────────────────────────────┘   │  
│                                                                       │  
│  ┌─────────────────────────────────────────────────────────────┐   │  
│  │ \[Situação \- Status\] Ativos ⚪ ▼                              │   │  
│  │ Description: Filtrar por status/situação do workspace      │   │  
│  │ Valores: Ativos (Active \- green icon), Inativos (Inactive) │   │  
│  └─────────────────────────────────────────────────────────────┘   │  
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐  
│  REGION AÇÕES E BUSCA (Actions and Search Region)                   │  
│                                                                       │  
│  \[+ Adicionar workspace\] \[▼ Dropdown\]                                │  
│  Dropdown Menu Options:                                              │  
│    \- Adicionar workspace (Add single workspace)                     │  
│    \- Adicionar múltiplas workspaces (Bulk add)                     │  
│    \- Configurar equipe (Configure team)                            │  
│                                                                       │  
│  \[🔍 Buscar...\] \[↗ Exportar para Excel\]                             │  
│  Search: Busca em tempo real na tabela                              │  
│  Export: Exporta lista de workspaces em formato Excel               │  
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐  
│  TABELA DE WORKSPACES (Workspaces Table)                            │  
│                                                                       │  
│  Colunas (Sortable):                                                 │  
│  \[☑\] | ID | Workspace | Proprietário | Squad | Tipo acesso | Ativa │  
│                                                                       │  
│  Exemplo de Linha:                                                   │  
│  \[☐\] | 148801 | Padrão | \[Logo\] Kev Seguros | \- | \- | \-           │  
│       ├─ Link clicável: "Padrão"                                    │  
│       ├─ Ações: \[✏️ Editar\] \[📋 Duplicar\] \[🗑️ Excluir\]             │  
│       └─ \[Copiar Id\] tooltip em hover no ID                         │  
│                                                                       │  
│  Status de Itens: "1 item" (count de registros)                    │  
└─────────────────────────────────────────────────────────────────────┘  
\`\`\`

\*\*Componentes Detalhados:\*\*

1\. \*\*Filter Region \- Tags\*\*  
   \- Label: "Tags. Clique no nome para selecionar apenas uma, ou na caixa de seleção para várias"  
   \- Tipo: Dropdown com multi-seleção  
   \- Estado Padrão: "Todas tags" (All tags)  
   \- Comportamento: Click no tag label \= seleção única | Click na checkbox \= multi-seleção  
   \- Ícone: \[local\_offer\] tag icon

2\. \*\*Filter Region \- Situação (Status)\*\*  
   \- Label: "Situação. Clique no nome para selecionar"  
   \- Tipo: Dropdown simples  
   \- Valores Disponíveis:   
     \- "Ativos" (Active) \- com ícone verde \[play\_circle\_outline\]  
     \- "Inativos" (Inactive) \- presume-se ter ícone desativado  
   \- Estado Padrão: "Ativos" (pre-filtered to active workspaces)

3\. \*\*Add Workspace Button\*\*  
   \- Tipo: Link/Button com ícone \[add\]  
   \- Label: "Adicionar workspace"  
   \- Comportamento: Clique abre formulário de criação de novo workspace (modal ou página)  
   \- Dropdown Arrow: Menu dropdown adicional com opções:  
     \- "Adicionar workspace" (padrão \- single add)  
     \- "Adicionar múltiplas workspaces" (bulk add feature)  
     \- "Configurar equipe" (team configuration)

4\. \*\*Search Bar\*\*  
   \- Placeholder: "Buscar..."  
   \- Type: Text input  
   \- Comportamento: Busca em tempo real nos dados da tabela  
   \- Scope: Busca em colunas da tabela (ID, Workspace, Proprietário, etc)

5\. \*\*Export Button\*\*  
   \- Ícone: \[launch\] (external link icon)  
   \- Label: "Exportar dados para excel"  
   \- Comportamento: Exporta dados da tabela em formato .xlsx  
   \- Formato: Inclui todas as colunas visíveis

6\. \*\*Workspaces Table\*\*  
   \- Estrutura: HTML table com 6 colunas principais  
   \- Coluna 1: Checkbox para seleção múltipla de linhas  
   \- Coluna 2: ID (numeric, sortable)  
   \- Coluna 3: Workspace Name (text, sortable, clickable link)  
   \- Coluna 4: Proprietário/Owner (image \+ text, sortable)  
   \- Coluna 5: Squad (text, sortable, pode ser vazio)  
   \- Coluna 6: Tipo acesso (Access Type, text, sortable, pode ser vazio)  
   \- Coluna 7: Ativa (Active status, boolean, sortable)  
     
   \*\*Ações por Linha:\*\*  
   \- Editar \[✏️ edit icon\] \- Abre formulário de edição  
   \- Duplicar \[📋 content\_copy icon\] \- Duplica workspace com novas configurações  
   \- Excluir \[🗑️ delete icon\] \- Delete com confirmação provável

\---

\#\# 3\. HIERARQUIA E RELACIONAMENTOS

\*\*Estrutura de Dados da Entidade Workspace:\*\*

\`\`\`  
┌─────────────────────────────────────────────────────────────────┐  
│                        WORKSPACE ENTITY                         │  
├─────────────────────────────────────────────────────────────────┤  
│                                                                  │  
│  Identificadores:                                               │  
│  ├─ ID: Numeric unique identifier (e.g., 148801\)              │  
│  ├─ Nome: Text name (e.g., "Padrão", "Cliente X", "Marketing") │  
│  └─ Status: Enum (Ativo/Inativo \= Active/Inactive)            │  
│                                                                  │  
│  Relacionamentos Principais:                                    │  
│  ├─ has-many: Projetos (Projects belong to this workspace)    │  
│  ├─ has-many: Tarefas (Tasks in projects within this ws)      │  
│  ├─ has-many: Usuários (Users assigned to this workspace)     │  
│  ├─ has-many: Equipes (Teams within this workspace)           │  
│  ├─ has-one: Fluxo de Trabalho Padrão (Default workflow)      │  
│  ├─ has-many: Fluxos de Trabalho (Custom workflows)           │  
│  ├─ has-many: Squads (Team groups within workspace)           │  
│  ├─ has-many: Tags (Workspace can be tagged for organization) │  
│  └─ belongs-to: Proprietário/Owner (Empresa/Company)          │  
│                                                                  │  
│  Configurações & Permissões:                                    │  
│  ├─ Tipo de Acesso: Access control type (public/private/teams) │  
│  ├─ Permissões por Papel: Role-based access (Admin/Ed/Viewer) │  
│  ├─ Modelos de Checklist: Workspace-specific checklists       │  
│  └─ Integrações: Workspace-scoped integrations/channels       │  
│                                                                  │  
│  Dados Operacionais:                                            │  
│  ├─ Data de Criação: Timestamp creation                        │  
│  ├─ Criado por: User who created this workspace                │  
│  ├─ Data Última Modificação: Last edit timestamp               │  
│  ├─ Modificado por: User who last edited                       │  
│  └─ Squad Associado: Link to squad (optional)                  │  
│                                                                  │  
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐  
│              DIAGRAMA DE RELACIONAMENTOS (ERD)                   │  
│                                                                  │  
│  ┌──────────────┐              ┌──────────────┐               │  
│  │ WORKSPACE    │──many to────\>│  PROJETO     │               │  
│  │ \- ID         │   many       │ \- ID         │               │  
│  │ \- Nome       │   (1:N)      │ \- Nome       │               │  
│  │ \- Status     │              │ \- Workspace  │               │  
│  │ \- Owner      │              └──────────────┘               │  
│  └──────────────┘                      │                      │  
│         │                               │                      │  
│         │                      many to many                    │  
│         │                               │                      │  
│         │                              ▼                       │  
│  ┌──────┴────────────┐          ┌──────────────┐              │  
│  │ USUARIO/USER      │          │ TAREFA       │              │  
│  │ (via User-WS Link)│          │ \- ID         │              │  
│  │ \- Perfil          │          │ \- Projeto    │              │  
│  │ \- Permissões      │          │ \- Status     │              │  
│  │ \- Ativo/Inativo   │          │ \- Responsável│              │  
│  └───────────────────┘          └──────────────┘              │  
│         │                               ▲                       │  
│         └───────┬──────────────────────┘                       │  
│                 │                                              │  
│            Share Work                                          │  
│            & Tasks                                             │  
│                                                                │  
│  ┌─────────────────┐     ┌──────────────────┐                │  
│  │ EQUIPE/TEAM     │────\>│ FLUXO TRABALHO   │                │  
│  │ \- ID            │     │ (Workflow)       │                │  
│  │ \- Nome          │     │ \- Etapas/Phases  │                │  
│  │ \- Workspace     │     │ \- Workspace      │                │  
│  └─────────────────┘     └──────────────────┘                │  
│         │                                                     │  
│         │                ┌──────────────────┐                │  
│         └───────────────\>│ SQUAD            │                │  
│                          │ \- ID             │                │  
│                          │ \- Nome           │                │  
│                          │ \- Workspace      │                │  
│                          └──────────────────┘                │  
│                                                                │  
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐  
│          MAPEAMENTO: WORKSPACE → Outros Módulos                   │  
│                                                                   │  
│  1\. Tipos de Tarefa:                                             │  
│     └─ Workspace pode ter tipos de tarefa específicos           │  
│     └─ Restringe tipos disponíveis para criação de tarefas     │  
│                                                                   │  
│  2\. Fluxo de Trabalho (Workflow):                               │  
│     └─ Cada workspace tem seu próprio fluxo padrão             │  
│     └─ Pode ter múltiplos fluxos customizados por ws            │  
│     └─ Etapas (phases) são específicas do workspace             │  
│                                                                   │  
│  3\. Usuários (Users):                                            │  
│     └─ Usuário pode ter acesso a múltiplos workspaces          │  
│     └─ Cada acesso tem diferentes permissões/papéis            │  
│     └─ Controle granular por perfil (Admin/Editor/Viewer)      │  
│                                                                   │  
│  4\. Equipes e Profissionais (Teams & Members):                  │  
│     └─ Equipes são criadas dentro de um workspace               │  
│     └─ Profissionais/membros pertencem a equipes               │  
│     └─ Escopo de equipe limitado ao workspace                  │  
│                                                                   │  
│  5\. Projetos (Projects):                                         │  
│     └─ Todo projeto deve pertencer a um workspace               │  
│     └─ Workspace determina quem pode acessar projetos           │  
│     └─ Isolamento de dados por workspace                        │  
│                                                                   │  
│  6\. Tarefas (Tasks):                                             │  
│     └─ Tarefas herdam workspace do seu projeto                 │  
│     └─ Filtragem de tarefas pode incluir workspace              │  
│     └─ Responsáveis vêm de usuários do workspace               │  
│                                                                   │  
│  7\. Modelos de Checklist:                                        │  
│     └─ Podem ser criados por workspace                          │  
│     └─ Disponibilidade restrita ao seu workspace                │  
│                                                                   │  
│  8\. Canais e Integração (Channels & Integration):               │  
│     └─ Integrações podem ser workspace-specific                │  
│     └─ Canais limitados a um workspace                          │  
│                                                                   │  
│  9\. Squads e Tags:                                               │  
│     └─ Squads criados dentro de um workspace                    │  
│     └─ Tags podem ser workspace-specific ou globais             │  
│                                                                   │  
│ 10\. Data-Driven / Análises (Analytics & Reports):              │  
│     └─ Relatórios e dashboards podem ser por workspace          │  
│     └─ Atividades por Workspace é uma opção de análise         │  
│                                                                   │  
└──────────────────────────────────────────────────────────────────┘  
\`\`\`

\*\*Tipos de Relacionamento:\*\*

1\. \*\*Workspace ↔ Usuários\*\*  
   \- Tipo: Many-to-Many (através de tabela associativa)  
   \- Atributos da relação: Perfil (Profile), Permissões, Data de acesso, Status (Ativo/Inativo)  
   \- Cardinalidade: Um usuário pode estar em múltiplos workspaces com papéis diferentes  
   \- Exemplo: Usuário "João" pode ser "Admin" no Workspace "Marketing" mas "Editor" no Workspace "Vendas"

2\. \*\*Workspace ↔ Projetos\*\*  
   \- Tipo: One-to-Many (um workspace contém múltiplos projetos)  
   \- Relacionamento: É obrigatório (todo projeto pertence a exatamente um workspace)  
   \- Escopo: Projetos são filhos do workspace

3\. \*\*Workspace ↔ Fluxo de Trabalho\*\*  
   \- Tipo: One-to-Many (um workspace contém múltiplos workflows)  
   \- Especial: Um fluxo é definido como "padrão" para o workspace  
   \- Implicação: Novas tarefas no workspace usam o workflow padrão a menos que outro seja explicitamente selecionado

4\. \*\*Workspace ↔ Equipes\*\*  
   \- Tipo: One-to-Many (um workspace contém múltiplas equipes)  
   \- Isolamento: Equipes de um workspace não veem equipes de outro

5\. \*\*Workspace ↔ Squads\*\*  
   \- Tipo: One-to-Many (um workspace contém múltiplos squads)  
   \- Organização: Squad é subdivisão de workspace para agrupamento de equipes

\---

\#\# 4\. FLUXO DE VIDA (LIFECYCLE)

\*\*Estados do Workspace e Transições:\*\*

\`\`\`  
┌────────────────────────────────────────────────────────────────┐  
│                  WORKSPACE LIFECYCLE STATES                     │  
├────────────────────────────────────────────────────────────────┤  
│                                                                  │  
│   ┌──────────────────────────────────────────────────────────┐  │  
│   │  CRIAÇÃO DO WORKSPACE (Creation)                         │  │  
│   ├──────────────────────────────────────────────────────────┤  │  
│   │  Fluxo:                                                  │  │  
│   │  1\. Usuário Admin clica em "Adicionar workspace"        │  │  
│   │  2\. Sistema abre formulário de criação (modal/form)     │  │  
│   │  3\. Usuário preenche campos obrigatórios:               │  │  
│   │     \- Nome do Workspace (required)                       │  │  
│   │     \- Proprietário/Owner (required \- default: current)  │  │  
│   │     \- Squad (optional)                                  │  │  
│   │     \- Tipo de Acesso (required \- default: "Todos")     │  │  
│   │     \- Fluxo de Trabalho Padrão (required)              │  │  
│   │     \- Tags (optional \- múltiplas)                       │  │  
│   │  4\. Usuário clica "Salvar" / "Criar"                   │  │  
│   │  5\. Sistema valida dados:                               │  │  
│   │     \- Nome não vazio e único no contexto               │  │  
│   │     \- Proprietário válido                              │  │  
│   │     \- Tipo de Acesso em lista permitida                │  │  
│   │     \- Fluxo de Trabalho existente e ativo              │  │  
│   │  6\. Se válido: Workspace criado com status "Ativo"     │  │  
│   │  7\. Se inválido: Mostra erro, permite correção         │  │  
│   │  8\. Workspace aparece na lista com status ⚪ "Ativo"   │  │  
│   └──────────────────────────────────────────────────────────┘  │  
│                                                                  │  
│   ┌──────────────────────────────────────────────────────────┐  │  
│   │  ESTADO: ATIVO (Active State)                           │  │  
│   ├──────────────────────────────────────────────────────────┤  │  
│   │  Características:                                        │  │  
│   │  ✓ Workspace é operacional                              │  │  
│   │  ✓ Usuários com acesso podem criar/editar projetos     │  │  
│   │  ✓ Tarefas podem ser criadas em seus projetos           │  │  
│   │  ✓ Fluxos de trabalho estão ativos                      │  │  
│   │  ✓ Aparecem em filtros e seleções                       │  │  
│   │  ✓ Dados estão visíveis para usuários autorizados      │  │  
│   │                                                         │  │  
│   │  Ações Disponíveis:                                     │  │  
│   │  \- Editar configurações                                 │  │  
│   │  \- Duplicar workspace                                   │  │  
│   │  \- Desativar (mudar para Inativo)                      │  │  
│   │  \- Excluir (com restrições)                            │  │  
│   │  \- Gerenciar usuários/acesso                            │  │  
│   │  \- Adicionar projetos/tarefas                           │  │  
│   └──────────────────────────────────────────────────────────┘  │  
│                                                                  │  
│   ┌──────────────────────────────────────────────────────────┐  │  
│   │  EDIÇÃO DE WORKSPACE (Editing)                          │  │  
│   ├──────────────────────────────────────────────────────────┤  │  
│   │  Fluxo de Edição:                                       │  │  
│   │  1\. Usuário clica "Editar" ao lado do workspace         │  │  
│   │  2\. Sistema abre formulário com dados pré-preenchidos  │  │  
│   │  3\. Campos editáveis:                                   │  │  
│   │     \- Nome (pode renomear)                              │  │  
│   │     \- Tags (adicionar/remover)                          │  │  
│   │     \- Tipo de Acesso (pode mudar)                      │  │  
│   │     \- Squad (pode associar/desassociar)                │  │  
│   │     \- Status (Ativo/Inativo) \- podem desativar         │  │  
│   │  4\. Campos não editáveis (locked):                     │  │  
│   │     \- ID (imutável)                                     │  │  
│   │     \- Proprietário Original (possivelmente)            │  │  
│   │     \- Data de Criação (informacional)                  │  │  
│   │  5\. Usuário faz mudanças e clica "Salvar"             │  │  
│   │  6\. Sistema valida e persiste mudanças                 │  │  
│   │  7\. Feedback: "Workspace atualizado com sucesso"       │  │  
│   │                                                         │  │  
│   │  Restrições de Edição:                                 │  │  
│   │  \- Workspace com projetos ativo: certos campos locked  │  │  
│   │  \- Mudança de Tipo de Acesso afeta visibilidade       │  │  
│   │  \- Remover Squad pode impactar equipes                 │  │  
│   └──────────────────────────────────────────────────────────┘  │  
│                                                                  │  
│   ┌──────────────────────────────────────────────────────────┐  │  
│   │  DUPLICAÇÃO DE WORKSPACE (Duplication)                  │  │  
│   ├──────────────────────────────────────────────────────────┤  │  
│   │  Fluxo:                                                 │  │  
│   │  1\. Usuário clica "Duplicar" ao lado do workspace      │  │  
│   │  2\. Sistema abre modal com opções:                      │  │  
│   │     \- Nome para novo workspace (obrigatório)           │  │  
│   │     \- Copiar configurações? (Yes/No)                   │  │  
│   │     \- Copiar projetos? (Yes/No)                        │  │  
│   │     \- Copiar fluxos customizados? (Yes/No)            │  │  
│   │     \- Copiar usuários/acesso? (Yes/No)                │  │  
│   │     \- Copiar tags? (Yes/No)                            │  │  
│   │  3\. Usuário seleciona opções e clica "Duplicar"       │  │  
│   │  4\. Sistema:                                            │  │  
│   │     \- Cria novo workspace com novo ID                  │  │  
│   │     \- Copia elementos conforme selecionado             │  │  
│   │     \- Gera novo nome de workspace padrão               │  │  
│   │     \- Reseta IDs para novos elementos                  │  │  
│   │     \- Mantém status "Ativo"                             │  │  
│   │  5\. Novo workspace aparece na lista                    │  │  
│   └──────────────────────────────────────────────────────────┘  │  
│                                                                  │  
│   ┌──────────────────────────────────────────────────────────┐  │  
│   │  ESTADO: INATIVO (Inactive State)                       │  │  
│   ├──────────────────────────────────────────────────────────┤  │  
│   │  Como Chegar:                                           │  │  
│   │  \- Editar workspace e mudar status para "Inativo"      │  │  
│   │  \- Pode ser reativado a qualquer tempo                 │  │  
│   │                                                         │  │  
│   │  Características:                                        │  │  
│   │  ✗ Workspace não é operacional                         │  │  
│   │  ✗ Usuários não podem criar/editar itens              │  │  
│   │  ✗ Não aparece em filtros (opcional)                  │  │  
│   │  ✗ Dados permanecem intactos (apenas ocultos)         │  │  
│   │  ✓ Pode ser reativado sem perda de dados              │  │  
│   │                                                         │  │  
│   │  Casos de Uso:                                          │  │  
│   │  \- Arquivar workspace de projeto encerrado             │  │  
│   │  \- Desativar workspace de cliente antigo                │  │  
│   │  \- Manutenção/backup antes de operação crítica         │  │  
│   └──────────────────────────────────────────────────────────┘  │  
│                                                                  │  
│   ┌──────────────────────────────────────────────────────────┐  │  
│   │  EXCLUSÃO DE WORKSPACE (Deletion)                       │  │  
│   ├──────────────────────────────────────────────────────────┤  │  
│   │  Fluxo:                                                 │  │  
│   │  1\. Usuário clica "Excluir" ao lado do workspace       │  │  
│   │  2\. Sistema mostra diálogo de confirmação:             │  │  
│   │     "Tem certeza que deseja excluir \[Nome\]?"           │  │  
│   │     "Esta ação é irreversível"                         │  │  
│   │  3\. Pré-validações:                                     │  │  
│   │     \- Se workspace tem projetos ativos: bloqueia       │  │  
│   │     \- Se workspace tem usuários assignados: aviso      │  │  
│   │     \- Se workspace padrão da empresa: bloqueia         │  │  
│   │  4\. Se pré-validação OK: Usuário confirma             │  │  
│   │  5\. Sistema:                                            │  │  
│   │     \- Remove todas as associações (usuários, projetos) │  │  
│   │     \- Deleta dados do workspace (reversível via backup)│  │  
│   │     \- Remove da lista                                   │  │  
│   │  6\. Workspace desaparece da interface                  │  │  
│   │                                                         │  │  
│   │  Restrições:                                            │  │  
│   │  \- Não pode deletar se tem projetos em progresso       │  │  
│   │  \- Admin precisa confirmar em diálogo duplo            │  │  
│   │  \- Pode haver soft-delete (dados mantidos em backup)   │  │  
│   └──────────────────────────────────────────────────────────┘  │  
│                                                                  │  
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐  
│             DIAGRAMA DE TRANSIÇÃO DE ESTADOS                    │  
├────────────────────────────────────────────────────────────────┤  
│                                                                  │  
│                      ┌─────────────────┐                        │  
│                      │   CRIANDO       │                        │  
│                      │  (Creating)     │                        │  
│                      └────────┬────────┘                        │  
│                               │ Form Submit OK                 │  
│                               ▼                                 │  
│          ┌────────────────────────────────────────┐            │  
│          │        ATIVO / ACTIVE (✓ ready)       │            │  
│          │                                         │            │  
│          │ ◄─────────────┐                        │            │  
│          │               │ Reativar              │            │  
│          └──────┬────────┘                        │            │  
│                 │ Desativar                        │            │  
│                 ▼                                 │            │  
│          ┌─────────────────────┐                 │            │  
│          │  INATIVO / INACTIVE │─────────────────┘            │  
│          │   (🔒 archived)     │                              │  
│          └──────┬──────────────┘                              │  
│                 │ Excluir/Deletar                             │  
│                 ▼                                              │  
│          ┌─────────────────────┐                              │  
│          │   DELETADO/DELETED  │                              │  
│          │   (Permanently ✗)   │                              │  
│          └─────────────────────┘                              │  
│                                                                  │  
└────────────────────────────────────────────────────────────────┘  
\`\`\`

\*\*Transições Permitidas:\*\*

| Estado Atual | Ação Possível | Estado Destino | Permissão Requerida |  
|---|---|---|---|  
| Criando | Validação OK | Ativo | Form valid |  
| Criando | Validação ERRO | Criando | Usuário corrige |  
| Ativo | Editar | Ativo | Admin/Owner |  
| Ativo | Desativar | Inativo | Admin/Owner |  
| Ativo | Duplicar | Ativo (novo) | Admin |  
| Ativo | Excluir | Deletado | Admin (com validações) |  
| Inativo | Reativar | Ativo | Admin/Owner |  
| Inativo | Editar | Inativo | Admin/Owner |  
| Inativo | Excluir | Deletado | Admin |

\---

\#\# 5\. CAMPOS DO FORMULÁRIO DETALHADOS

\*\*Formulário de Criação/Edição de Workspace:\*\*

\`\`\`  
┌────────────────────────────────────────────────────────────────┐  
│         FORMULÁRIO: Adicionar / Editar Workspace               │  
├────────────────────────────────────────────────────────────────┤  
│                                                                  │  
│ ╔═ CAMPO 1: NOME DO WORKSPACE ════════════════════════════════╗│  
│ ║                                                              ║│  
│ ║ Label: "Nome do Workspace" ou "Workspace Name"             ║│  
│ ║ Tipo: Text Input (single line)                              ║│  
│ ║ Placeholder: "Ex: Marketing, Cliente XYZ, Vendas"          ║│  
│ ║ Obrigatório: SIM (required field)                           ║│  
│ ║ Tamanho Máximo: \~100 caracteres (estimate)                 ║│  
│ ║ Validação:                                                  ║│  
│ ║   • Não vazio                                               ║│  
│ ║   • Único no contexto de Workspaces da empresa             ║│  
│ ║   • Não pode conter caracteres especiais perigosos          ║│  
│ ║ Erro Padrão: "Nome é obrigatório"                          ║│  
│ ║             "Um workspace com este nome já existe"          ║│  
│ ║ Valor Default: Vazio (criação) / Nome atual (edição)       ║│  
│ ║ Help Text: "Escolha um nome descritivo para seu workspace"║║  
│ ║ Dica: Usar nomes claros: "Marketing", "Cliente-ABC", etc   ║│  
│ ║                                                              ║│  
│ ╚═══════════════════════════════════════════════════════════════╝│  
│                                                                  │  
│ ╔═ CAMPO 2: PROPRIETÁRIO / OWNER ════════════════════════════╗│  
│ ║                                                              ║│  
│ ║ Label: "Proprietário" ou "Owner" ou "Responsável"          ║│  
│ ║ Tipo: Dropdown / Searchable Select                          ║│  
│ ║ Obrigatório: SIM (required field)                           ║│  
│ ║ Dados: Lista de usuários da empresa com perfil Admin/Owner  ║│  
│ ║ Validação:                                                  ║│  
│ ║   • Usuário selecionado existe                              ║│  
│ ║   • Usuário é válido/ativo                                  ║│  
│ ║ Valor Default:                                              ║│  
│ ║   • Criação: Usuário logado (current user)                 ║│  
│ ║   • Edição: Proprietário atual                              ║│  
│ ║ Comportamento:                                              ║│  
│ ║   • Searchable: Permite digitar para filtrar                ║│  
│ ║   • Mostra foto \+ nome do usuário                           ║│  
│ ║   • Pode ser mudado em edição (se permissão)               ║│  
│ ║ Permissão para Mudar: Admin \> Owner do workspace           ║│  
│ ║ Impacto: Define quem é responsável primário pelo workspace ║│  
│ ║                                                              ║│  
│ ╚═══════════════════════════════════════════════════════════════╝│  
│                                                                  │  
│ ╔═ CAMPO 3: SQUAD (OPTIONAL) ════════════════════════════════╗│  
│ ║                                                              ║║  
│ ║ Label: "Squad" ou "Equipe de Trabalho" ou "Time"           ║│  
│ ║ Tipo: Dropdown / Single Select                              ║│  
│ ║ Obrigatório: NÃO (optional field)                           ║│  
│ ║ Dados: Lista de Squads disponíveis na empresa              ║│  
│ ║ Validação:                                                  ║│  
│ ║   • Se preenchido: Squad existe e é ativo                  ║│  
│ ║ Valor Default: Vazio/None (nenhum squad selecionado)       ║│  
│ ║ Comportamento:                                              ║│  
│ ║   • Opcional: pode deixar em branco                         ║│  
│ ║   • Single select: apenas um squad por workspace            ║│  
│ ║   • Se workspace tem squad: limita certos acessos          ║│  
│ ║ Impacto de Associação:                                      ║│  
│ ║   • Squad é restrito a um workspace                         ║│

\# ANÁLISE DETALHADA DO MÓDULO WORKSPACES \- eKyte  
\#\# (Continuação \- Seções 5-14)

\---

\#\# 5\. CAMPOS DO FORMULÁRIO DETALHADOS (CONTINUAÇÃO)

\*\*Formulário de Criação/Edição de Workspace (Continuação):\*\*

\`\`\`  
│ ║ Efeito Operacional:                                          ║│  
│ ║   • Squad pode ter acesso restrito ao workspace             ║│  
│ ║   • Filtra disponibilidade de recursos                      ║│  
│ ║                                                              ║│  
│ ╚═══════════════════════════════════════════════════════════════╝│  
│                                                                  │  
│ ╔═ CAMPO 4: TIPO DE ACESSO ══════════════════════════════════╗│  
│ ║                                                              ║│  
│ ║ Label: "Tipo de Acesso" ou "Access Type" ou "Acesso"       ║│  
│ ║ Tipo: Dropdown / Single Select (radio buttons possible)     ║│  
│ ║ Obrigatório: SIM (required field)                           ║│  
│ ║ Valores Disponíveis:                                         ║│  
│ ║   • "Todos" / "Everyone" (Padrão \- All users can access)   ║│  
│ ║   • "Somente Equipe" / "Team Only" (Restrict to team)       ║│  
│ ║   • "Privado" / "Private" (Owner/Admin only)                ║│  
│ ║   • "Customizado" / "Custom" (Define granular permissions)  ║│  
│ ║ Validação:                                                  ║│  
│ ║   • Tipo selecionado está em lista permitida               ║│  
│ ║   • Se "Custom": pelo menos um grupo tem acesso            ║│  
│ ║ Valor Default: "Todos" (Everyone \- most permissive)        ║│  
│ ║ Impacto:                                                    ║│  
│ ║   • "Todos": Visível para todos na empresa                 ║│  
│ ║   • "Equipe": Apenas membros do squad veem                 ║│  
│ ║   • "Privado": Apenas owner/admin                          ║│  
│ ║   • "Custom": Permissões específicas por usuário/grupo     ║│  
│ ║ Comportamento:                                              ║│  
│ ║   • Se muda tipo: sistema recalcula visibilidade            ║│  
│ ║   • Podem perder acesso usuários (se mais restritivo)      ║│  
│ ║   • Sistema pode avisar impacto                             ║│  
│ ║                                                              ║│  
│ ╚═══════════════════════════════════════════════════════════════╝│  
│                                                                  │  
│ ╔═ CAMPO 5: FLUXO DE TRABALHO PADRÃO ════════════════════════╗│  
│ ║                                                              ║│  
│ ║ Label: "Fluxo de Trabalho Padrão" ou "Default Workflow"    ║│  
│ ║ Tipo: Dropdown / Single Select (searchable)                 ║│  
│ ║ Obrigatório: SIM (required field)                           ║│  
│ ║ Dados: Lista de fluxos ativos/validados na empresa          ║│  
│ ║ Validação:                                                  ║│  
│ ║   • Fluxo selecionado existe                                ║│  
│ ║   • Fluxo é ativo/habilitado                                ║│  
│ ║   • Fluxo não foi deletado                                  ║│  
│ ║ Valor Default:                                              ║│  
│ ║   • Criação: Primeiro fluxo disponível ou "Padrão"         ║│  
│ ║   • Edição: Fluxo atual                                     ║│  
│ ║ Comportamento:                                              ║│  
│ ║   • Searchable: pode digitar nome do fluxo                  ║│  
│ ║   • Mostra etapas do fluxo em preview                       ║│  
│ ║   • Can be changed in editing                               ║│  
│ ║ Impacto:                                                    ║│  
│ ║   • Define workflow padrão para novas tarefas               ║│  
│ ║   • Determina etapas disponíveis                            ║│  
│ ║   • Afeta criação de projetos neste workspace              ║│  
│ ║ Restrição:                                                  ║│  
│ ║   • Se mudar: tarefas existentes não são afetadas (usar    ║│  
│ ║     workflow anterior)                                      ║│  
│ ║   • Novo workflow aplica-se a novas tarefas apenas         ║│  
│ ║                                                              ║│  
│ ╚═══════════════════════════════════════════════════════════════╝│  
│                                                                  │  
│ ╔═ CAMPO 6: TAGS (OPCIONAL) ═════════════════════════════════╗│  
│ ║                                                              ║│  
│ ║ Label: "Tags" ou "Etiquetas" ou "Labels"                   ║│  
│ ║ Tipo: Multi-Select Dropdown / Tag Input (autocomplete)      ║│  
│ ║ Obrigatório: NÃO (optional field)                           ║│  
│ ║ Dados: Lista de tags existentes \+ opção de criar nova      ║│  
│ ║ Validação:                                                  ║│  
│ ║   • Tags selecionadas existem ou são criadas                ║│  
│ ║   • Nenhuma tag duplicada na seleção                        ║│  
│ ║ Valor Default: Vazio/None (sem tags)                        ║│  
│ ║ Comportamento:                                              ║│  
│ ║   • Multi-select: pode selecionar várias tags              ║│  
│ ║   • Autocomplete: digita e filtra tags existentes           ║│  
│ ║   • Create new: pode criar nova tag inline                  ║│  
│ ║   • Mostra tags como "chips" / "pills"                      ║│  
│ ║   • Click X na tag remove da seleção                        ║│  
│ ║ Impacto:                                                    ║│  
│ ║   • Facilita organização e filtragem de workspaces          ║│  
│ ║   • Tags aparecem em filtros da lista                       ║│  
│ ║   • Pode usar para agrupar workspaces por tipo              ║│  
│ ║ Exemplos de Tags:                                           ║│  
│ ║   • "Cliente", "Interno", "Teste"                          ║│  
│ ║   • "Marketing", "Vendas", "Operações"                     ║│  
│ ║   • "Ativo", "Arquivado", "Deprecado"                      ║│  
│ ║                                                              ║│  
│ ╚═══════════════════════════════════════════════════════════════╝│  
│                                                                  │  
│ ╔═ CAMPO 7: SITUAÇÃO / STATUS ════════════════════════════════╗│  
│ ║                                                              ║│  
│ ║ Label: "Situação" ou "Status" ou "State"                    ║│  
│ ║ Tipo: Radio Buttons ou Toggle / Binary Select               ║│  
│ ║ Obrigatório: SIM (required field)                           ║│  
│ ║ Valores Disponíveis:                                         ║│  
│ ║   • ⚪ "Ativo" / "Active" (workspace operacional)           ║│  
│ ║   • ⭕ "Inativo" / "Inactive" (archived/disabled)           ║│  
│ ║ Validação:                                                  ║│  
│ ║   • Status é um dos valores permitidos                      ║│  
│ ║ Valor Default:                                              ║│  
│ ║   • Criação: "Ativo" (active by default)                    ║│  
│ ║   • Edição: Status atual                                    ║│  
│ ║ Comportamento:                                              ║│  
│ ║   • Radio buttons ou toggle switch                          ║│  
│ ║   • Mudança imediata em tempo real                          ║│  
│ ║   • Confirmação se mudar de Ativo para Inativo             ║│  
│ ║ Impacto de Desativação (Ativo → Inativo):                  ║│  
│ ║   • Usuários não podem criar novos itens                    ║│  
│ ║   • Workspace não aparece em filtros                        ║│  
│ ║   • Dados permanecem intactos                               ║│  
│ ║   • Pode ser reativado a qualquer tempo                     ║│  
│ ║ Impacto de Ativação (Inativo → Ativo):                     ║│  
│ ║   • Workspace fica operacional novamente                    ║│  
│ ║   • Volta a aparecer em listas/filtros                      ║│  
│ ║   • Usuários podem realizar operações normalmente           ║│  
│ ║                                                              ║│  
│ ╚═══════════════════════════════════════════════════════════════╝│  
│                                                                  │  
│ ╔═ CAMPOS INFORMATIVOS (READ-ONLY) ══════════════════════════╗│  
│ ║                                                              ║│  
│ ║ CAMPO: ID do Workspace                                      ║│  
│ ║ Label: "ID" ou "Identificador"                              ║│  
│ ║ Tipo: Numeric (read-only, não editável)                     ║│  
│ ║ Valor: Auto-gerado pelo sistema (e.g., 148801\)             ║│  
│ ║ Visualização: Campo desabilitado ou texto simples           ║│  
│ ║ Ação Adicional: Botão "Copiar ID" para clipboard           ║│  
│ ║ Uso: Identificação única no sistema                         ║│  
│ ║                                                              ║│  
│ ║ CAMPO: Data de Criação                                      ║│  
│ ║ Label: "Criado em" ou "Data de Criação"                    ║│  
│ ║ Tipo: Datetime (read-only)                                  ║│  
│ ║ Formato: "DD/MM/YYYY HH:MM" ou "11/08/2026 10:30"         ║│  
│ ║ Uso: Auditoria e histórico                                  ║│  
│ ║                                                              ║│  
│ ║ CAMPO: Criado por                                            ║│  
│ ║ Label: "Criado por" ou "Criador"                            ║│  
│ ║ Tipo: User reference (read-only)                            ║│  
│ ║ Valor: Nome \+ foto do usuário que criou                     ║│  
│ ║ Uso: Rastreabilidade                                        ║│  
│ ║                                                              ║│  
│ ║ CAMPO: Data de Modificação                                  ║│  
│ ║ Label: "Última Modificação" ou "Atualizado em"             ║│  
│ ║ Tipo: Datetime (read-only)                                  ║│  
│ ║ Formato: Same as creation date                              ║│  
│ ║ Valor: Atualizado quando workspace é editado               ║│  
│ ║ Uso: Auditoria                                              ║│  
│ ║                                                              ║│  
│ ║ CAMPO: Modificado por                                        ║│  
│ ║ Label: "Modificado por" ou "Última atualização por"        ║│  
│ ║ Tipo: User reference (read-only)                            ║│  
│ ║ Valor: Nome \+ foto do último editor                         ║│  
│ ║ Uso: Rastreabilidade de mudanças                            ║│  
│ ║                                                              ║│  
│ ╚═══════════════════════════════════════════════════════════════╝│  
│                                                                  │  
│  BOTÕES DE AÇÃO:                                               │  
│  ┌────────────────────────┐  ┌─────────────────────┐         │  
│  │  \[💾 Salvar\]           │  │  \[✕ Cancelar\]       │         │  
│  │ (Save changes)         │  │ (Discard & close)   │         │  
│  └────────────────────────┘  └─────────────────────┘         │  
│                                                                  │  
│  Comportamento dos Botões:                                     │  
│  • Salvar: Valida todos os campos obrigatórios               │  
│  • Cancelar: Volta à lista sem salvar mudanças                │  
│  • Validação: Mostra erros inline antes de salvar             │  
│  • Loading: Mostra loading spinner durante POST/PUT           │  
│  • Feedback: Toast mensagem "Workspace criado/atualizado"     │  
│                                                                  │  
└────────────────────────────────────────────────────────────────┘  
\`\`\`

\---

\#\# 6\. MATRIZ DE PERMISSÕES E CONTROLE DE ACESSO

\*\*Matriz de Permissões por Papel (Role-Based Access Control \- RBAC):\*\*

\`\`\`  
┌──────────────────────────────────────────────────────────────────┐  
│      MATRIZ DE PERMISSÕES: WORKSPACES (RBAC)                      │  
├──────────────────────────────────────────────────────────────────┤  
│                                                                    │  
│ NÍVEIS DE ACESSO GLOBAIS (para acesso ao módulo Workspaces):    │  
│                                                                    │  
│ ┌─ Empresa Admin ────────────────────────────────────────────┐  │  
│ │  • Permissão para acessar: Configurações \> Workspaces     │  │  
│ │  • Status: Acesso total ao módulo                          │  │  
│ │  • Restrição: Nenhuma                                      │  │  
│ └────────────────────────────────────────────────────────────┘  │  
│                                                                    │  
│ ┌─ Gerenciador de Workspace ─────────────────────────────────┐  │  
│ │  • Permissão para acessar: Configurações \> Workspaces     │  │  
│ │  • Limite: Apenas workspaces que gerencia                 │  │  
│ └────────────────────────────────────────────────────────────┘  │  
│                                                                    │  
│ ┌─ Usuário Regular ──────────────────────────────────────────┐  │  
│ │  • Permissão para acessar: Configurações \> Workspaces     │  │  
│ │  • Visibilidade: Apenas workspaces com acesso granted     │  │  
│ │  • Ações: Visualizar (read-only)                           │  │  
│ └────────────────────────────────────────────────────────────┘  │  
│                                                                    │  
├──────────────────────────────────────────────────────────────────┤  
│                                                                    │  
│ MATRIZ DETALHADA DE AÇÕES (O que cada role pode fazer):         │  
│                                                                    │  
│                                                                    │  
│  AÇÃO: Visualizar Lista de Workspaces                            │  
│  ┌───────────────────────┬───────────────────────────────────┐  │  
│  │ Perfil/Role           │ Permissão                         │  │  
│  ├───────────────────────┼───────────────────────────────────┤  │  
│  │ Empresa Admin         │ ✓ SIM \- Vê todos                 │  │  
│  │ Gerenciador WS        │ ✓ SIM \- Vê seus workspaces       │  │  
│  │ Usuário Regular       │ ✓ SIM \- Vê com acesso granted    │  │  
│  │ Viewer/Leitor         │ ✓ SIM \- Vê com acesso granted    │  │  
│  └───────────────────────┴───────────────────────────────────┘  │  
│                                                                    │  
│  AÇÃO: Criar Novo Workspace                                      │  
│  ┌───────────────────────┬───────────────────────────────────┐  │  
│  │ Empresa Admin         │ ✓ SIM \- Sem restrição             │  │  
│  │ Gerenciador WS        │ ✗ NÃO \- Apenas Admin              │  │  
│  │ Usuário Regular       │ ✗ NÃO                             │  │  
│  │ Viewer/Leitor         │ ✗ NÃO                             │  │  
│  │                       │                                   │  │  
│  │ PRÉ-REQUISITO:        │ Ter pelo menos um Fluxo ativo    │  │  
│  └───────────────────────┴───────────────────────────────────┘  │  
│                                                                    │  
│  AÇÃO: Editar Workspace (Nome, Tags, Status, etc)               │  
│  ┌───────────────────────┬───────────────────────────────────┐  │  
│  │ Empresa Admin         │ ✓ SIM \- Todos os campos          │  │  
│  │ Gerenciador WS\*       │ ✓ SIM \- Seu workspace            │  │  
│  │ Proprietário WS\*\*     │ ✓ SIM \- Seu workspace            │  │  
│  │ Usuário Regular       │ ✗ NÃO                             │  │  
│  │ Viewer/Leitor         │ ✗ NÃO                             │  │  
│  │                       │                                   │  │  
│  │ \*Se é owner/manager   │                                   │  │  
│  │ \*\*Proprietário do WS  │                                   │  │  
│  └───────────────────────┴───────────────────────────────────┘  │  
│                                                                    │  
│  AÇÃO: Mudar Status (Ativo ↔ Inativo)                            │  
│  ┌───────────────────────┬───────────────────────────────────┐  │  
│  │ Empresa Admin         │ ✓ SIM \- Qualquer workspace       │  │  
│  │ Gerenciador WS        │ ✓ SIM \- Seu workspace            │  │  
│  │ Proprietário WS       │ ✓ SIM \- Seu workspace            │  │  
│  │ Usuário Regular       │ ✗ NÃO                             │  │  
│  │                       │                                   │  │  
│  │ ALERTA:               │ Desativar afeta todos os usuários │  │  
│  │                       │ do workspace\!                     │  │  
│  └───────────────────────┴───────────────────────────────────┘  │  
│                                                                    │  
│  AÇÃO: Duplicar Workspace                                        │  
│  ┌───────────────────────┬───────────────────────────────────┐  │  
│  │ Empresa Admin         │ ✓ SIM \- Sem restrição             │  │  
│  │ Gerenciador WS        │ \~ PARCIAL \- Seu workspace         │  │  
│  │ Proprietário WS       │ \~ PARCIAL \- Seu workspace         │  │  
│  │ Usuário Regular       │ ✗ NÃO                             │  │  
│  │ Viewer/Leitor         │ ✗ NÃO                             │  │  
│  │                       │                                   │  │  
│  │ NOTA:                 │ Criar novo requer Admin           │  │  
│  └───────────────────────┴───────────────────────────────────┘  │  
│                                                                    │  
│  AÇÃO: Excluir / Deletar Workspace                               │  
│  ┌───────────────────────┬───────────────────────────────────┐  │  
│  │ Empresa Admin         │ ✓ SIM \- Com confirmação           │  │  
│  │ Gerenciador WS        │ \~ PARCIAL \- Seu workspace (vazio) │  │  
│  │ Proprietário WS       │ \~ PARCIAL \- Se vazio              │  │  
│  │ Usuário Regular       │ ✗ NÃO                             │  │  
│  │ Viewer/Leitor         │ ✗ NÃO                             │  │  
│  │                       │                                   │  │  
│  │ RESTRIÇÃO:            │ Não pode deletar se tem projetos  │  │  
│  │                       │ ativas no workspace              │  │  
│  └───────────────────────┴───────────────────────────────────┘  │  
│                                                                    │  
│  AÇÃO: Gerenciar Acesso (Adicionar/Remover Usuários)            │  
│  ┌───────────────────────┬───────────────────────────────────┐  │  
│  │ Empresa Admin         │ ✓ SIM \- Qualquer workspace       │  │  
│  │ Gerenciador WS        │ ✓ SIM \- Seu workspace            │  │  
│  │ Proprietário WS       │ ✓ SIM \- Seu workspace            │  │  
│  │ Usuário Regular       │ ✗ NÃO                             │  │  
│  │ Viewer/Leitor         │ ✗ NÃO                             │  │  
│  │                       │                                   │  │  
│  │ DETALHE:              │ Pode convidar novos usuários     │  │  
│  │                       │ ou reatribuir papéis             │  │  
│  └───────────────────────┴───────────────────────────────────┘  │  
│                                                                    │  
│  AÇÃO: Atribuir Workspace Padrão (Default)                       │  
│  ┌───────────────────────┬───────────────────────────────────┐  │  
│  │ Empresa Admin         │ ✓ SIM \- Para qualquer usuário    │  │  
│  │ Gerenciador WS        │ ✗ NÃO                             │  │  
│  │ Proprietário WS       │ ✗ NÃO                             │  │  
│  │ Usuário Regular       │ ✗ NÃO                             │  │  
│  │                       │                                   │  │  
│  │ EFEITO:               │ Workspace padrão abre ao login   │  │  
│  └───────────────────────┴───────────────────────────────────┘  │  
│                                                                    │  
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐  
│        CONTROLE DE ACESSO DENTRO DE UM WORKSPACE                 │  
│        (Quem pode fazer o quê DENTRO do workspace)               │  
├──────────────────────────────────────────────────────────────────┤  
│                                                                    │  
│  Perfil de Acesso a um Workspace (3 níveis):                    │  
│                                                                    │  
│  1\. ADMIN (Administrador do Workspace)                           │  
│     Símbolo: 👤 Admin / A+                                       │  
│     Permissões:                                                  │  
│     ✓ Criar/Editar/Deletar Projetos                             │  
│     ✓ Criar/Editar/Deletar Tarefas                              │  
│     ✓ Atribuir responsáveis                                      │  
│     ✓ Mudar status de tarefas                                    │  
│     ✓ Ver relatórios completos                                   │  
│     ✓ Gerenciar equipes dentro do workspace                      │  
│     ✓ Convidar novos usuários                                    │  
│     ✓ Mudar permissões de outros usuários                        │  
│     ✓ Acessar todas as funcionalidades                           │  
│                                                                    │  
│  2\. EDITOR (Editor do Workspace)                                 │  
│     Símbolo: ✏️ Editor / E+                                      │  
│     Permissões:                                                  │  
│     ✓ Criar/Editar Projetos                                     │  
│     ✓ Criar/Editar Tarefas                                      │  
│     ✓ Atribuir responsáveis (em seus projetos)                  │  
│     ✓ Mudar status de tarefas (suas próprias)                   │  
│     ✓ Ver relatórios de seus projetos                            │  
│     ✗ Deletar projetos/tarefas (apenas Admin)                    │  
│     ✗ Convidar usuários ou mudar permissões                      │  
│     ✗ Gerenciar equipes                                          │  
│                                                                    │  
│  3\. VIEWER/LEITOR (Visualizador do Workspace)                    │  
│     Símbolo: 👁️ Viewer / V                                       │  
│     Permissões:                                                  │  
│     ✓ Visualizar Projetos e Tarefas                             │  
│     ✓ Visualizar comentários                                     │  
│     ✓ Ver relatórios (read-only)                                 │  
│     ✓ Buscar e filtrar tarefas                                   │  
│     ✗ Criar/Editar/Deletar nada                                  │  
│     ✗ Atribuir responsáveis                                      │  
│     ✗ Mudar status                                               │  
│     ✗ Criar tarefas                                              │  
│                                                                    │  
└──────────────────────────────────────────────────────────────────┘  
\`\`\`

\---

\#\# 7\. FILTROS E BUSCA

\*\*Capacidades de Filtro:\*\*

| Filtro | Tipo | Comportamento | Efeito |  
|--------|------|---------------|--------|  
| \*\*Tags\*\* | Multi-select dropdown | Click tag \= seleção única; click checkbox \= multi-seleção | Mostra apenas workspaces com as tags selecionadas |  
| \*\*Situação/Status\*\* | Single select | Dropdown (Ativos, Inativos) | Filtra por status \- padrão é "Ativos" |  
| \*\*Proprietário\*\* | Searchable select (inferido) | Não visível na interface atual, mas provável em administração | Poderia filtrar por owner |  
| \*\*Squad\*\* | Possible filter (inferido) | Dropdown possível | Filtrar por squad associado |

\*\*Busca:\*\*

\- \*\*Campo de Busca\*\*: "Buscar..." text input  
\- \*\*Escopo\*\*: Busca em tempo real sobre:  
  \- Nome do Workspace  
  \- ID do Workspace  
  \- Nome do Proprietário  
\- \*\*Comportamento\*\*: Filtragem live enquanto digita  
\- \*\*Tipo\*\*: Full-text search (não case-sensitive presumidamente)

\---

\#\# 8\. AÇÕES DISPONÍVEIS NA LISTA

\*\*Ações por Linha de Workspace:\*\*

\`\`\`  
┌─────────────────────────────────────────────────────────────┐  
│              AÇÕES DISPONÍVEIS (Row Actions)                │  
├─────────────────────────────────────────────────────────────┤  
│                                                              │  
│ 1\. VISUALIZAR WORKSPACE (Click no nome)                     │  
│    Ícone: \[Nenhum, apenas texto clicável\]                  │  
│    Comportamento: Abre detalhes/overview do workspace      │  
│    Permissão: Todos com acesso ao workspace               │  
│    Resultado: Página de detalhes com estatísticas          │  
│                                                              │  
│ 2\. EDITAR WORKSPACE                                         │  
│    Ícone: \[✏️ edit\]                                         │  
│    Comportamento: Abre formulário de edição                │  
│    Permissão: Admin \+ Owner/Manager do workspace           │  
│    Campos Editáveis: Nome, Tags, Tipo de Acesso, Status   │  
│    Resultado: Mostra confirmação "Workspace atualizado"   │  
│                                                              │  
│ 3\. DUPLICAR WORKSPACE                                       │  
│    Ícone: \[📋 content\_copy\]                                 │  
│    Comportamento: Abre modal com opções de duplicação      │  
│    Permissão: Admin apenas (ou gerenciador do WS)         │  
│    Opções:                                                  │  
│      • Nome para novo workspace                            │  
│      • Copiar configurações? (Yes/No)                      │  
│      • Copiar projetos? (Yes/No)                           │  
│      • Copiar fluxos? (Yes/No)                             │  
│      • Copiar usuários? (Yes/No)                           │  
│    Resultado: Novo workspace criado (cópia)               │  
│                                                              │  
│ 4\. EXCLUIR / DELETAR WORKSPACE                              │  
│    Ícone: \[🗑️ delete\]                                       │  
│    Comportamento: Mostra confirmação \+ restrições          │  
│    Permissão: Admin apenas                                  │  
│    Restrições:                                              │  
│      • Não pode deletar se tem projetos ativos             │  
│      • Não pode deletar workspace padrão                   │  
│      • Não pode deletar se tem usuários assignados         │  
│    Confirmação: "Tem certeza? Esta ação é irreversível"  │  
│    Resultado: Workspace e dados são deletados             │  
│                                                              │  
│ 5\. COPIAR ID (Tooltip em hover do ID)                      │  
│    Ícone: \[Automático em hover\]                            │  
│    Comportamento: Copia ID para clipboard                  │  
│    Resultado: "ID copiado" toast notification             │  
│                                                              │  
└─────────────────────────────────────────────────────────────┘  
\`\`\`

\*\*Ações em Lote (Bulk Actions) \- via dropdown "Adicionar workspace":\*\*

\`\`\`  
┌─────────────────────────────────────────────────────────────┐  
│            AÇÕES EM DROPDOWN (Bulk/Admin)                   │  
├─────────────────────────────────────────────────────────────┤  
│                                                              │  
│ 1\. Adicionar workspace (Single)                             │  
│    → Abre formulário de criação individual                 │  
│    Permissão: Admin                                         │  
│                                                              │  
│ 2\. Adicionar múltiplas workspaces (Bulk)                   │  
│    → Abre modal para criar múltiplas de uma vez           │  
│    Entrada: CSV/Tabela com dados                          │  
│    Permissão: Admin                                         │  
│    Comportamento:                                           │  
│      • Permite inserir dados de múltiplas linhas           │  
│      • Valida em batch                                      │  
│      • Cria todos de uma vez (transação)                   │  
│                                                              │  
│ 3\. Configurar equipe                                        │  
│    → Abre interface para gerenciar usuários do workspace   │  
│    Permissão: Admin \+ Manager do workspace                 │  
│    Funcionalidade:                                          │  
│      • Adicionar usuários                                   │  
│      • Remover acesso                                       │  
│      • Mudar perfil (Admin/Editor/Viewer)                  │  
│                                                              │  
└─────────────────────────────────────────────────────────────┘  
\`\`\`

\---

\#\# 9\. INTEGRAÇÃO COM OUTROS MÓDULOS

\*\*Mapa de Integração \- Workspaces e seus Dependentes:\*\*

\`\`\`  
┌──────────────────────────────────────────────────────────────────┐  
│        INTEGRAÇÃO: WORKSPACES ↔ OUTROS MÓDULOS                   │  
├──────────────────────────────────────────────────────────────────┤  
│                                                                    │  
│ ╔═ WORKSPACE ↔ TIPOS DE TAREFA ══════════════════════════════╗  │  
│ ║                                                              ║  │  
│ ║ Relação: One-to-Many (1 workspace : N tipos de tarefa)    ║  │  
│ ║ Escopo: Tipos de tarefa são específicos do workspace      ║  │  
│ ║                                                              ║  │  
│ ║ Impacto:                                                    ║  │  
│ ║  • Ao criar tarefa em projeto do WS: só tipos do WS        ║  │  
│ ║  • Tipos criados em um WS não aparecem em outro            ║  │  
│ ║  • Deletar WS: deveria deletar seus tipos (cascata)        ║  │  
│ ║                                                              ║  │  
│ ║ Fluxo de Dados:                                             ║  │  
│ ║  Workspace \[148801\] → Tipos de Tarefa \[Bug, Feature, ...\]║  │  
│ ║       ↓                      ↓                              ║  │  
│ ║    "Padrão"  ←────────────── \[2 tipos em 'Padrão'\]        ║  │  
│ ║                                                              ║  │  
│ ╚══════════════════════════════════════════════════════════════╝  │  
│                                                                    │  
│ ╔═ WORKSPACE ↔ FLUXO DE TRABALHO ════════════════════════════╗  │  
│ ║                                                              ║  │  
│ ║ Relação: One-to-Many (1 WS : N workflows)                 ║  │  
│ ║ Especial: Um fluxo é designado como "padrão"              ║  │  
│ ║                                                              ║  │  
│ ║ Impacto:                                                    ║  │  
│ ║  • Fluxo padrão: usado em novas tarefas do WS              ║  │  
│ ║  • Etapas (phases) são específicas do workflow do WS       ║  │  
│ ║  • Tarefas do WS usam etapas do seu fluxo                  ║  │  
│ ║  • Mudar fluxo padrão: não afeta tarefas existentes        ║  │  
│ ║                                                              ║  │  
│ ║ Fluxo de Dados:                                             ║  │  
│ ║  Workspace \[148801\]                                         ║  │  
│ ║       ├─ Fluxo Padrão: \[Marketing Workflow\]               ║  │  
│ ║       │      ├─ Fase 1: Planejamento                       ║  │  
│ ║       │      ├─ Fase 2: Execução                           ║  │  
│ ║       │      └─ Fase 3: Entrega                            ║  │  
│ ║       └─ Fluxos Adicionais: \[Vendas Workflow, etc\]        ║  │  
│ ║                                                              ║  │  
│ ╚══════════════════════════════════════════════════════════════╝  │  
│                                                                    │  
│ ╔═ WORKSPACE ↔ USUÁRIOS ══════════════════════════════════════╗  │  
│ ║                                                              ║  │  
│ ║ Relação: Many-to-Many (N usuários : N workspaces)         ║  │  
│ ║ Atributos: Perfil (Admin/Editor/Viewer), Status, Acesso   ║  │  
│ ║                                                              ║  │  
│ ║ Fluxo:                                                      ║  │  
│ ║  • Usuário pode ter múltiplos workspaces                   ║  │  
│ ║  • Cada acesso tem perfil diferente                        ║  │  
│ ║  Exemplo: João (Admin em Marketing, Editor em Vendas)    ║  │  
│ ║                                                              ║  │  
│ ║ Impacto:                                                    ║  │  
│ ║  • Quem vê workspace: quem tem acesso granted             ║  │  
│ ║  • Quem pode criar tarefas: seus usuários                 ║  │  
│ ║  • Filtragem de projetos: por usuários do WS               ║  │  
│ ║  • Deletar WS: remove todas as associações de usuários    ║  │  
│ ║                                                              ║  │  
│ ║ Gerenciamento:                                              ║  │  
│ ║  • Convidar usuário → seleciona workspace \+ perfil         ║  │  
│ ║  • Remover acesso → desfaz associação                      ║  │  
│ ║  • Mudar perfil → edita role do usuário n

\# ANÁLISE DETALHADA DO MÓDULO WORKSPACES \- eKyte  
\#\# (Seções 9-14 \- CONCLUSÃO)

\---

\#\# 9\. INTEGRAÇÃO COM OUTROS MÓDULOS (CONTINUAÇÃO COMPLETA)

\*\*Mapa de Integração \- Workspaces e seus Dependentes (Continuação):\*\*

\`\`\`  
│ ║  Workspace \[148801\]                                         ║  │  
│ ║  ├─ Usuário: João Silva (Admin)                             ║  │  
│ ║  ├─ Usuário: Maria Santos (Editor)                          ║  │  
│ ║  └─ Usuário: Pedro Costa (Viewer)                           ║  │  
│ ║                                                              ║  │  
│ ║ Quando deletar WS: Remove todas essas associações           ║  │  
│ ║                                                              ║  │  
│ ╚══════════════════════════════════════════════════════════════╝  │  
│                                                                    │  
│ ╔═ WORKSPACE ↔ PROJETOS ══════════════════════════════════════╗  │  
│ ║                                                              ║  │  
│ ║ Relação: One-to-Many (1 WS : N projetos) \- OBRIGATÓRIO    ║  │  
│ ║ Escopo: Todo projeto DEVE pertencer a um workspace         ║  │  
│ ║                                                              ║  │  
│ ║ Impacto:                                                    ║  │  
│ ║  • Projeto não pode existir sem workspace                   ║  │  
│ ║  • Workspace isolamento de dados: projeto A ≠ projeto B     ║  │  
│ ║  • Acesso ao projeto: determinado pelo acesso ao WS        ║  │  
│ ║  • Deletar WS: deve primeiro deletar/mover projetos        ║  │  
│ ║  • Fluxo padrão do projeto: vem do fluxo do WS             ║  │  
│ ║                                                              ║  │  
│ ║ Fluxo de Dados:                                             ║  │  
│ ║  Workspace \[148801 \- "Padrão"\]                             ║  │  
│ ║       ├─ Projeto \[1001 \- "Campanha Q3"\]                     ║  │  
│ ║       │      ├─ Status: Ativo                               ║  │  
│ ║       │      └─ Fluxo: Marketing Workflow (herdado do WS)  ║  │  
│ ║       ├─ Projeto \[1002 \- "Website Redesign"\]               ║  │  
│ ║       │      └─ Status: Planejamento                        ║  │  
│ ║       └─ Projeto \[1003 \- "Email Campaign"\]                 ║  │  
│ ║                                                              ║  │  
│ ║ Restrição de Exclusão:                                      ║  │  
│ ║  • Não pode deletar WS se tem projetos ATIVOS              ║  │  
│ ║  • Deve arquivar/deletar projetos primeiro                 ║  │  
│ ║                                                              ║  │  
│ ╚══════════════════════════════════════════════════════════════╝  │  
│                                                                    │  
│ ╔═ WORKSPACE ↔ TAREFAS ════════════════════════════════════════╗  │  
│ ║                                                              ║  │  
│ ║ Relação: One-to-Many (Indirect via Projetos)               ║  │  
│ ║ Conexão: Workspace → Projeto → Tarefa (cadeia)             ║  │  
│ ║                                                              ║  │  
│ ║ Impacto:                                                    ║  │  
│ ║  • Tarefas herdam workspace de seu projeto                 ║  │  
│ ║  • Responsáveis vêm de usuários do workspace               ║  │  
│ ║  • Etapas (phases) da tarefa vêm do fluxo do WS            ║  │  
│ ║  • Filtro de tarefas: pode incluir filtro por workspace    ║  │  
│ ║  • Visualizações (Kanban, Gantt, etc): escopo do WS        ║  │  
│ ║                                                              ║  │  
│ ║ Fluxo de Dados:                                             ║  │  
│ ║  Workspace \[Padrão\]                                         ║  │  
│ ║       ├─ Projeto \[Campanha Q3\]                              ║  │  
│ ║       │      ├─ Tarefa \[1 \- Pesquisa de Mercado\]           ║  │  
│ ║       │      │     ├─ Responsável: João (usuário do WS)    ║  │  
│ ║       │      │     └─ Status: Etapa 1 (do workflow WS)     ║  │  
│ ║       │      └─ Tarefa \[2 \- Design Criativo\]               ║  │  
│ ║       │             └─ Status: Etapa 2                      ║  │  
│ ║       └─ Projeto \[Website Redesign\]                        ║  │  
│ ║              └─ Tarefas \[...\] (mesmo workspace)             ║  │  
│ ║                                                              ║  │  
│ ║ Cascata de Deletamento:                                     ║  │  
│ ║  Deletar Workspace → Deletar Projetos → Deletar Tarefas    ║  │  
│ ║                                                              ║  │  
│ ╚══════════════════════════════════════════════════════════════╝  │  
│                                                                    │  
│ ╔═ WORKSPACE ↔ EQUIPES E PROFISSIONAIS ════════════════════════╗  │  
│ ║                                                              ║  │  
│ ║ Relação: One-to-Many (1 WS : N equipes)                    ║  │  
│ ║ Escopo: Equipes são criadas/gerenciadas dentro do WS       ║  │  
│ ║                                                              ║  │  
│ ║ Impacto:                                                    ║  │  
│ ║  • Equipes são específicas do workspace                     ║  │  
│ ║  • Equipe não pode ter membros de outro workspace           ║  │  
│ ║  • Profissionais/membros: vêm do pool de usuários do WS   ║  │  
│ ║  • Deletar WS: deve remover/arquivar equipes               ║  │  
│ ║                                                              ║  │  
│ ║ Fluxo de Dados:                                             ║  │  
│ ║  Workspace \[Padrão\]                                         ║  │  
│ ║       ├─ Equipe \[Marketing Team\]                            ║  │  
│ ║       │      ├─ Membro: João Silva (usuário do WS)         ║  │  
│ ║       │      ├─ Membro: Maria Santos (usuário do WS)       ║  │  
│ ║       │      └─ Membro: Pedro Costa (usuário do WS)        ║  │  
│ ║       └─ Equipe \[Design Team\]                               ║  │  
│ ║              ├─ Membro: Ana Silva                           ║  │  
│ ║              └─ Membro: Carlos Oliveira                     ║  │  
│ ║                                                              ║  │  
│ ║ Restrição:                                                  ║  │  
│ ║  • Ao convidar usuário: deve indicar workspace \+ equipe    ║  │  
│ ║  • Usuário só vê equipes de seu workspace                  ║  │  
│ ║                                                              ║  │  
│ ╚══════════════════════════════════════════════════════════════╝  │  
│                                                                    │  
│ ╔═ WORKSPACE ↔ SQUADS ════════════════════════════════════════╗  │  
│ ║                                                              ║  │  
│ ║ Relação: One-to-Many (1 WS : N squads) \- OPCIONAL          ║  │  
│ ║ Escopo: Squad é agrupamento de equipes dentro do WS        ║  │  
│ ║                                                              ║  │  
│ ║ Impacto:                                                    ║  │  
│ ║  • Squad específico do workspace (não shared)               ║  │  
│ ║  • Workspace pode ter múltiplos squads                      ║  │  
│ ║  • Squad é opcional (nem todo WS precisa)                  ║  │  
│ ║  • Squad agrupa múltiplas equipes                           ║  │  
│ ║                                                              ║  │  
│ ║ Fluxo de Dados:                                             ║  │  
│ ║  Workspace \[Padrão\]                                         ║  │  
│ ║       ├─ Squad \[Produto Squad\]                              ║  │  
│ ║       │      ├─ Equipe \[Backend Team\]                       ║  │  
│ ║       │      └─ Equipe \[Frontend Team\]                      ║  │  
│ ║       └─ Squad \[Marketing Squad\]                            ║  │  
│ ║              ├─ Equipe \[Content Team\]                       ║  │  
│ ║              └─ Equipe \[Social Media Team\]                  ║  │  
│ ║                                                              ║  │  
│ ║ Efeito em Permissões:                                       ║  │  
│ ║  • Se WS tem Squad: Tipo de Acesso pode ser "Squad Only"  ║  │  
│ ║  • Squad restricts visibility de projetos/tarefas           ║  │  
│ ║                                                              ║  │  
│ ╚══════════════════════════════════════════════════════════════╝  │  
│                                                                    │  
│ ╔═ WORKSPACE ↔ CANAIS E INTEGRAÇÃO ══════════════════════════╗  │  
│ ║                                                              ║  │  
│ ║ Relação: Many-to-Many (N canais podem ser WS-specific)    ║  │  
│ ║ Escopo: Integrações podem ser por workspace                ║  │  
│ ║                                                              ║  │  
│ ║ Impacto:                                                    ║  │  
│ ║  • Canais (Slack, Email, etc) podem ser workspace-specific ║  │  
│ ║  • Não partilham credenciais/configurações entre WS        ║  │  
│ ║  • Cada WS pode ter suas próprias integrações              ║  │  
│ ║                                                              ║  │  
│ ║ Exemplos:                                                   ║  │  
│ ║  Workspace \[Marketing\] → Slack \#marketing-tasks             ║  │  
│ ║  Workspace \[Vendas\]    → Slack \#sales-tasks (diferente)    ║  │  
│ ║                                                              ║  │  
│ ║ Configuração:                                               ║  │  
│ ║  • Ao configurar canal: seleciona workspace-alvo            ║  │  
│ ║  • Notificações de tarefas: vão para canal do workspace    ║  │  
│ ║                                                              ║  │  
│ ╚══════════════════════════════════════════════════════════════╝  │  
│                                                                    │  
│ ╔═ WORKSPACE ↔ MODELOS DE CHECKLIST ═════════════════════════╗  │  
│ ║                                                              ║  │  
│ ║ Relação: One-to-Many (1 WS : N modelos) \- OPCIONAL         ║  │  
│ ║ Escopo: Checklists podem ser criados por workspace          ║  │  
│ ║                                                              ║  │  
│ ║ Impacto:                                                    ║  │  
│ ║  • Modelos de checklist: específicos do workspace           ║  │  
│ ║  • Ao criar tarefa: templates disponíveis são do WS        ║  │  
│ ║  • Modelos não são compartilhados entre workspaces         ║  │  
│ ║                                                              ║  │  
│ ║ Exemplo:                                                    ║  │  
│ ║  Workspace \[Marketing\] → Template: "Content Review"         ║  │  
│ ║  Workspace \[Vendas\]    → Template: "Sales Call Script"     ║  │  
│ ║                         (diferentes templates)              ║  │  
│ ║                                                              ║  │  
│ ╚══════════════════════════════════════════════════════════════╝  │  
│                                                                    │  
│ ╔═ WORKSPACE ↔ DATA-DRIVEN / ANÁLISES ════════════════════════╗  │  
│ ║                                                              ║  │  
│ ║ Relação: One-to-Many (1 WS : N análises/dashboards)       ║  │  
│ ║ Escopo: Relatórios e dashboards podem ser por workspace    ║  │  
│ ║                                                              ║  │  
│ ║ Impacto:                                                    ║  │  
│ ║  • "Atividades por Workspace" é uma análise padrão         ║  │  
│ ║  • Dashboards podem ser filtrados por workspace            ║  │  
│ ║  • Dados de um WS não aparecem em análises de outro        ║  │  
│ ║  • KPIs são calculados por workspace (isolado)             ║  │  
│ ║                                                              ║  │  
│ ║ Exemplos de Análises:                                       ║  │  
│ ║  • "Gestão de Produtividade" (por WS)                      ║  │  
│ ║  • "Atividades por Executor" (filtra por WS)               ║  │  
│ ║  • "Atividades por Workspace" (mostra comparação)           ║  │  
│ ║                                                              ║  │  
│ ║ Dashboard Disponível:                                       ║  │  
│ ║  Menu → Data-Driven → Atividades por Workspace             ║  │  
│ ║  (análise comparativa dos workspaces)                       ║  │  
│ ║                                                              ║  │  
│ ╚══════════════════════════════════════════════════════════════╝  │  
│                                                                    │  
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐  
│        TABELA RESUMIDA: WORKSPACE vs OUTROS MÓDULOS               │  
├──────────────────────────────────────────────────────────────────┤  
│                                                                    │  
│ Módulo              │ Relação      │ Escopo        │ Obrigatório │  
│ ────────────────────┼──────────────┼───────────────┼──────────── │  
│ Tipos de Tarefa     │ 1:N          │ WS-specific   │ Sim         │  
│ Fluxo de Trabalho   │ 1:N (padrão) │ WS-specific   │ Sim         │  
│ Usuários            │ N:N          │ Acesso        │ Sim         │  
│ Projetos            │ 1:N          │ WS-specific   │ Sim         │  
│ Tarefas             │ 1:N (via P)  │ Herdado WS    │ Sim         │  
│ Equipes             │ 1:N          │ WS-specific   │ Não         │  
│ Squads              │ 1:N          │ WS-specific   │ Não         │  
│ Canais/Integração   │ N:N          │ Pode ser WS   │ Não         │  
│ Modelos Checklist   │ 1:N          │ WS-specific   │ Não         │  
│ Data-Driven/EDD     │ 1:N (rel)    │ Pode filtrar  │ Não         │  
│                                                                    │  
│ Legenda:                                                           │  
│ 1:N \= One to Many (um WS : muitos itens)                        │  
│ N:N \= Many to Many (muitos WS : muitos itens)                   │  
│ WS-specific \= Dados isolados por workspace                       │  
│ Herdado \= Pega configuração do workspace parent                  │  
│ Via P \= Relacionamento indireto (através de Projetos)           │  
│                                                                    │  
└──────────────────────────────────────────────────────────────────┘  
\`\`\`

\---

\#\# 10\. REGRAS DE NEGÓCIO E RESTRIÇÕES

\*\*Regras Críticas do Sistema:\*\*

\`\`\`  
┌──────────────────────────────────────────────────────────────────┐  
│         REGRAS DE NEGÓCIO: WORKSPACES                            │  
├──────────────────────────────────────────────────────────────────┤  
│                                                                    │  
│ REGRA 1: Unicidade de Nome                                       │  
│ ────────────────────────────────────────────────────────────────  │  
│ Descrição: Nome de workspace deve ser único na empresa           │  
│ Scope: Por empresa (não global no sistema)                       │  
│ Validação: Quando criar/editar, sistema verifica duplicata       │  
│ Mensagem de Erro: "Um workspace com este nome já existe"        │  
│ Exemplo:                                                          │  
│   ✓ "Marketing" em empresa A                                    │  
│   ✓ "Marketing" em empresa B (diferente, permitido)            │  
│   ✗ Dois "Marketing" na mesma empresa A (ERRO)                 │  
│ Impacto: Facilita busca e reconhecimento de workspaces          │  
│                                                                    │  
│ REGRA 2: Workspace Padrão Obrigatório                            │  
│ ────────────────────────────────────────────────────────────────  │  
│ Descrição: Toda empresa DEVE ter pelo menos 1 workspace ativo   │  
│ Padrão: "Padrão" (criado automaticamente ao setup)              │  
│ Validação: Sistema não permite deletar último workspace         │  
│ Implicação: Sempre há um workspace, nunca vazio                 │  
│ Efeito: Usuários sem workspace específico vão para "Padrão"    │  
│                                                                    │  
│ REGRA 3: Fluxo de Trabalho Requerido                             │  
│ ────────────────────────────────────────────────────────────────  │  
│ Descrição: Todo workspace PRECISA de fluxo padrão               │  
│ Validação: Não pode salvar workspace sem fluxo                  │  
│ Pre-requisito: Deve existir pelo menos 1 fluxo ativo            │  
│ Mensagem de Erro: "Selecione um Fluxo de Trabalho padrão"      │  
│ Impacto: Define estrutura de etapas para tarefas                │  
│ Padrão do Sistema: Se não especificado, usa "Fluxo Padrão"     │  
│                                                                    │  
│ REGRA 4: Proprietário Sempre Definido                            │  
│ ────────────────────────────────────────────────────────────────  │  
│ Descrição: Workspace sempre tem um proprietário                 │  
│ Padrão: Usuário que cria (geralmente Admin logado)              │  
│ Mutabilidade: Pode ser mudado se Admin (edição)                │  
│ Permissão: Proprietário tem Admin implícito                     │  
│ Impacto: Define responsabilidade e acesso primário             │  
│                                                                    │  
│ REGRA 5: Isolamento de Dados                                     │  
│ ────────────────────────────────────────────────────────────────  │  
│ Descrição: Dados de um WS não veem dados de outro               │  
│ Scope: Projetos, Tarefas, Usuários, Equipes                     │  
│ Query Filtering: Todas as queries filtram por workspace         │  
│ Segurança: Usuário sem acesso não vê dados                      │  
│ Implicação: Workspace \= segurança de dados                       │  
│                                                                    │  
│ Exemplo:                                                          │  
│   Usuário A (WS-Marketing) ↛ não vê projetos de WS-Vendas      │  
│   Usuário B (WS-Vendas) ↛ não vê projetos de WS-Marketing      │  
│   Usuário C (ambos) → vê ambos (múltiplos acessos)             │  
│                                                                    │  
│ REGRA 6: Não Pode Deletar se Tem Projetos Ativos                │  
│ ────────────────────────────────────────────────────────────────  │  
│ Descrição: Bloqueio de deleção com proteção de dados            │  
│ Validação: Sistema checa contagem de projetos antes de deletar  │  
│ Mensagem: "Não é possível deletar. Workspace tem projetos."    │  
│ Solução: Deve arquivar/deletar projetos primeiro                │  
│ Implicação: Previne perda acidental de dados                    │  
│                                                                    │  
│ REGRA 7: Status Controla Operacionalidade                        │  
│ ────────────────────────────────────────────────────────────────  │  
│ Descrição:                                                       │  
│   Ativo \= Workspace operacional (tudo funciona)                 │  
│   Inativo \= Workspace bloqueado (read-only, sem criar)          │  
│ Permissões Afetadas:                                             │  
│   ├─ Criar projeto: ✗ em Inativo                                │  
│   ├─ Criar tarefa: ✗ em Inativo                                 │  
│   ├─ Editar: ✗ em Inativo (exceto Admin desativar)             │  
│   └─ Visualizar: ✓ em Inativo (ainda visível)                  │  
│ Reativação: Pode ser reativado a qualquer tempo (sem perda)    │  
│ Impacto: Permite "arquivamento lógico" sem deletar              │  
│                                                                    │  
│ REGRA 8: Tipo de Acesso Controla Visibilidade                   │  
│ ────────────────────────────────────────────────────────────────  │  
│ Descrição: Determina quem vê/acessa o workspace                 │  
│                                                                    │  
│ "Todos" (Everyone):                                              │  
│   ├─ Todos na empresa veem o workspace                          │  
│   ├─ Default: acesso é Viewer (read-only)                       │  
│   └─ Impacto: Maior visibilidade, menos restritivo              │  
│                                                                    │  
│ "Somente Equipe" (Team Only):                                    │  
│   ├─ Apenas membros do squad veem                               │  
│   ├─ Requer: Squad selecionado no workspace                     │  
│   └─ Impacto: Moderado \- isolamento por squad                   │  
│                                                                    │  
│ "Privado" (Private):                                             │  
│   ├─ Apenas Owner e Admin veem                                  │  
│   ├─ Usuários convidados conseguem acesso                       │  
│   └─ Impacto: Máxima restrição e sigilo                         │  
│                                                                    │  
│ "Customizado" (Custom):                                          │  
│   ├─ Permissões granulares por usuário/grupo                    │  
│   ├─ Requer: Setup de permissões                                │  
│   └─ Impacto: Flexível, mais complexo de gerenciar              │  
│                                                                    │  
│ REGRA 9: Mudança de Tipo de Acesso tem Efeito Imediato         │  
│ ────────────────────────────────────────────────────────────────  │  
│ Descrição: Ao mudar tipo de acesso, visibilidade muda na hora  │  
│ Validação: Sistema pode mostrar impacto antes de salvar          │  
│ Aviso: "Esta mudança afetará X usuários"                       │  
│ Restrição: De mais restritivo para menos \= usuários ganham      │  
│            De menos restritivo para mais \= usuários perdem       │  
│ Reversível: Sim, pode voltar atrás                              │  
│                                                                    │  
│ REGRA 10: Fluxo Padrão Só Afeta Novas Tarefas                  │  
│ ────────────────────────────────────────────────────────────────  │  
│ Descrição: Mudar fluxo padrão não afeta tarefas existentes     │  
│ Escopo: Novo fluxo aplica-se apenas a tarefas criadas depois   │  
│ Tarefas antigas: Continuam com seu workflow original             │  
│ Implicação: Não quebra tarefas em progresso                      │  
│ Caso de Uso: Pode atualizar fluxo conforme empresa evolui       │  
│                                                                    │  
│ REGRA 11: Proprietário Não Pode Ser Deletado sem Substituto     │  
│ ────────────────────────────────────────────────────────────────  │  
│ Descrição: Se proprietário é deletado da empresa, workspace     │  
│           precisaria ter novo proprietário                       │  
│ Validação: Sistema reassign automaticamente ou bloqueia         │  
│ Impacto: Garante sempre há responsável pelo workspace           │  
│                                                                    │  
│ REGRA 12: Usuário Precisa Acesso ao WS para Ser Atribuído       │  
│ ────────────────────────────────────────────────────────────────  │  
│ Descrição: Não pode atribuir tarefa a usuário que não tem      │  
│           acesso ao workspace                                    │  
│ Validação: Dropdown de responsáveis filtra por usuários do WS  │  
│ Implicação: Garante que responsável pode executar a tarefa      │  
│ Workaround: Convidar usuário primeiro, depois atribuir         │  
│                                                                    │  
│ REGRA 13: Workspace Padrão Não Pode Ser Deletado                │  
│ ────────────────────────────────────────────────────────────────  │  
│ Descrição: Sistema bloqueia deleção do workspace "Padrão"       │  
│ Razão: Sempre há lugar para colocar novos projetos              │  
│ Impacto: Garante estabilidade e fallback                        │  
│ Workaround: Renomear, desativar, mas não deletar               │  
│                                                                    │  
│ REGRA 14: Tags São Opcionais mas Recomendadas                   │  
│ ────────────────────────────────────────────────────────────────  │  
│ Descrição: Não obrigatório, mas melhora organização            │  
│ Uso: Filtrar, agrupar, buscar workspaces relacionados          │  
│ Exemplo de Tags Boas:                                           │  
│   \- Por tipo: "Cliente", "Interno", "Departamento"             │  
│   \- Por status: "Ativo", "Arquivado", "Teste"                  │  
│   \- Por negócio: "Marketing", "Vendas", "Operações"            │  
│ Impacto: Facilita governance e organização                      │  
│                                                                    │  
└──────────────────────────────────────────────────────────────────┘  
\`\`\`

\---

\#\# 11\. EXEMPLOS PRÁTICOS E CASOS DE USO

\*\*Cenário 1: Agência de Marketing com Múltiplos Clientes\*\*

\`\`\`  
SITUAÇÃO:  
├─ Empresa: "Digital Marketing Agency XYZ"  
├─ Clientes: 5 clientes diferentes  
├─ Objetivo: Isolamento total de dados por cliente  
└─ Conformidade: LGPD (dados de clientes separados)

SOLUÇÃO COM WORKSPACES:  
├─ Workspace \[1\]: "Cliente A \- Indústria"  
│  ├─ Proprietário: Account Manager de A  
│  ├─ Tipo de Acesso: Privado (apenas equipe de A)  
│  ├─ Squad: Team A (3 designers, 2 copywriters)  
│  ├─ Projetos: Campanha Q3, Website redesign, Social media  
│  ├─ Usuários: 5 (account manager \+ team A \+ 1 agência lead)  
│  └─ Fluxo: Marketing Workflow  
│  
├─ Workspace \[2\]: "Cliente B \- Retail"  
│  ├─ Proprietário: Account Manager de B  
│  ├─ Tipo de Acesso: Privado  
│  ├─ Squad: Team B (2 designers, 1 analyst)  
│  ├─ Projetos: E-commerce optimization, Email campaigns  
│  ├─ Usuários: 4  
│  └─ Fluxo: Marketing Workflow (mesmo padrão)  
│  
├─ Workspace \[3\]: "Cliente C \- Tech Startup"  
│  ├─ Tipo: Privado (cliente solicitou máxima segurança)  
│  └─ ... (similar structure)  
│  
└─ Workspace \[4\]: "INTERNO \- Operações da Agência"  
   ├─ Proprietário: CEO da agência  
   ├─ Tipo de Acesso: Todos (anyone at agency)  
   ├─ Squad: Admin team  
   ├─ Projetos: Interno, Planejamento, RH, Financeiro  
   └─ Usuários: Todos na agência (15 pessoas)

BENEFÍCIOS:  
✓ Completo isolamento de dados de clientes  
✓ Cada cliente vê apenas seu workspace  
✓ Equipes de diferentes clientes não se veem  
✓ Relatórios por cliente: dados limpios e segregados  
✓ Auditoria fácil: quem acessou qual cliente  
✓ Segurança: deletar cliente \= deletar seu workspace  
✓ Conformidade LGPD: dados isolados por origem  
\`\`\`

\*\*Cenário 2: Empresa Grande com Múltiplos Departamentos\*\*

\`\`\`  
SITUAÇÃO:  
├─ Empresa: "ConglomCorp International"  
├─ Departamentos: Marketing, Vendas, Operações, RH, TI  
├─ Objetivo: Separar trabalho por departamento  
│            permitindo colaboração entre eles  
└─ Estrutura: Hierarquia clara

SOLUÇÃO COM WORKSPACES:  
├─ Workspace \[1\]: "MARKETING"  
│  ├─ Proprietário: VP Marketing  
│  ├─ Tipo de Acesso: "Somente Equipe" (Marketing Squad)  
│  ├─ Squad: Marketing Squad  
│  │  ├─ Equipe: Content Team (4 people)  
│  │  └─ Equipe: Campaigns Team (3 people)  
│  ├─ Projetos: Q3 Campaign, Website, Social media strategy  
│  └─ Usuários: 7 (só de marketing, excepto leads)  
│  
├─ Workspace \[2\]: "VENDAS"  
│  ├─ Proprietário: VP Vendas  
│  ├─ Squad: Vendas Squad  
│  ├─ Projetos: Client Onboarding, Prospecting, Contracts  
│  └─ Usuários: 12 (sales team \+ SDRs)  
│  
├─ Workspace \[3\]: "OPERAÇÕES"  
│  ├─ Tipo: "Equipe" (Ops Squad)  
│  ├─ Projetos: Process improvement, Hiring, Vendor management  
│  └─ Usuários: 5 (ops team)  
│  
└─ Workspace \[4\]: "CROSS-FUNCTIONAL INITIATIVES"  
   ├─ Proprietário: CEO  
   ├─ Tipo de Acesso: "Todos" (everyone in company)  
   ├─ Squad: Executive team  
   ├─ Projetos: Company-wide goals, Strategy review, All-hands  
   └─ Usuários: 30 (everyone \- Viewer role mostly)

FLUXO DE TAREFAS ENTRE WORKSPACES:  
1\. Marketing cria "Design approval needed" → atribui a designer do Marketing WS  
2\. Designer completa → Marketing team tira conclusões  
3\. Marketing cria "Vendas training on campaign" → cria tarefa em seu WS  
4\. Notificação para sales lead (que tem acesso ambos) → aprova  
5\. Vendas lead cria training task no VENDAS workspace → atribui SDRs

BENEFÍCIOS:  
✓ Separação clara de responsabilidades  
✓ Equipes focadas no seu workspace  
✓ Relatórios por departamento (isolados)  
✓ Permite colaboração cross-func (users em 2+ WS)  
✓ Escalabilidade: adicionar novo departamento \= novo WS  
✓ Governance: cada dept gerencia seu próprio WS  
\`\`\`

\*\*Cenário 3: Software House em Fase de Crescimento\*\*

\`\`\`  
SITUAÇÃO:  
├─ Empresa: "DevCorp Software House"  
├─ Fase: Crescimento rápido (20 devs, vai para 50\)  
├─ Estrutura: Projetos por cliente  
└─ Objetivo: Escalabilidade sem perder controle

WORKSPACE STRATEGY:  
├─ Workspace \[PROD\]: Produção \- clientes reais  
│  ├─ Status: Ativo  
│  ├─ Squad: Production Squad  
│  ├─ Projetos: \[Cliente 1 \- App mobile, Cliente 2 \- Platform, ...\]  
│  ├─ Tipo de Acesso: "Somente Equipe"  
│  ├─ Fluxo: Production Workflow (5 phases: Backlog→Dev→QA→Staging→Deploy)  
│  └─ Usuários: 20 (senior devs, senior QA, project managers)  
│  
├─ Workspace \[STAGING\]: Testes/Staging  
│  ├─ Status: Ativo  
│  ├─ Projetos: Testes de features, Melhorias, Experimentação  
│  ├─ Fluxo: Development Workflow (mais flexible)  
│  └─ Usuários: 15 (junior devs para learning)  
│  
└─ Workspace \[DEV/LAB\]: Desenvolvimento e Pesquisa  
   ├─ Status: Ativo  
   ├─ Tipo de Acesso: "Todos" (learning/poc allowed)  
   ├─ Projetos: POC, Tech spike, Training  
   ├─ Fluxo: Agile/Sprint Workflow  
   └─ Usuários: Todos (15 juniors \+ 5 seniors para mentoring)

WORKFLOW REAL:  
1\. Junior dev em DEV WS: cria spike "Test new framework"  
2\. Senior reviews → aprova → "escalate to STAGING"  
3\. Task moves to STAGING → dev implements feature  
4\. QA testa → se OK → "escalate to PROD"  
5\. In PROD: integrado no projeto do cliente real

ESCALABILIDADE:  
├─ Quando chegar 50 devs:  
│  ├─ PROD ainda \= 20-25 (senior only)  
│  ├─ STAGING \= 15-20 (mid-level)  
│  └─ DEV \= 30+ (everyone, open learning)  
│  
└─ Pode adicionar PROD2, PROD3 (por cliente tipo)

FLUXO PADRÃO EVOLUTION:  
├─ Começou com: Simple Workflow (3 fases)  
├─ Cresceu para: Production Workflow (5 fases)  
└─ Pode evoluir para: Custom by project (cada cliente)  
   (Fluxo padrão pode ser mudado sem quebrar WS)

BENEFÍCIOS:  
✓ Separação clara de qualidade: DEV ≠ STAGING ≠ PROD  
✓ Escalabilidade: fácil adicionar novos devs a DEV WS  
✓ Training: juniors aprendem em DEV WS seguro  
✓ Production safety: seniors na PROD WS  
✓ Flexibility: pode ter múltiplas PROD WS (por cliente tipo)  
✓ Clear career path: DEV → STAGING → PROD progression  
\`\`\`

\---

\#\# 12\. ESTRUTURA DE DADOS / SCHEMA

\*\*Inferência de Database Schema (baseado na UI e padrões observados):\*\*

\`\`\`sql  
┌────────────────────────────────────────────────────────────────────┐  
│               TABELAS PRINCIPAIS                                   │  
└────────────────────────────────────────────────────────────────────┘

TABLE: workspaces  
─────────────────────────────────────────────────────────────────────  
Coluna                  │ Tipo          │ Constraints      │ Descrição  
────────────────────────┼───────────────┼──────────────────┼──────────  
id                      │ BIGINT        │ PK, AUTO\_INC     │ Identificador único (ex

\# ANÁLISE DETALHADA DO MÓDULO WORKSPACES \- eKyte  
\#\# (Seções 12-14 \- CONCLUSÃO FINAL)

\---

\#\# 12\. ESTRUTURA DE DADOS / DATABASE SCHEMA (COMPLETO)

\*\*Inferência de Database Schema (baseado na UI e padrões observados):\*\*

\`\`\`sql  
┌────────────────────────────────────────────────────────────────────┐  
│               TABELAS PRINCIPAIS                                   │  
└────────────────────────────────────────────────────────────────────┘

\-- \============================================================  
\-- TABLE: workspaces  
\-- Descrição: Tabela principal de workspaces  
\-- \============================================================  
CREATE TABLE workspaces (  
    id BIGINT PRIMARY KEY AUTO\_INCREMENT,  
      
    \-- Identificação  
    name VARCHAR(100) NOT NULL UNIQUE,  
    description TEXT,  
      
    \-- Relacionamentos  
    company\_id BIGINT NOT NULL REFERENCES companies(id),  
    owner\_id BIGINT NOT NULL REFERENCES users(id),  
    default\_workflow\_id BIGINT NOT NULL REFERENCES workflows(id),  
    squad\_id BIGINT NULLABLE REFERENCES squads(id),  
      
    \-- Configuração  
    access\_type ENUM('EVERYONE', 'TEAM\_ONLY', 'PRIVATE', 'CUSTOM')   
                DEFAULT 'EVERYONE',  
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',  
      
    \-- Auditoria  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    created\_by BIGINT NOT NULL REFERENCES users(id),  
    updated\_at TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,  
    updated\_by BIGINT NOT NULL REFERENCES users(id),  
    deleted\_at TIMESTAMP NULLABLE,  
    deleted\_by BIGINT NULLABLE REFERENCES users(id),  
      
    \-- Indexação  
    INDEX idx\_company\_id (company\_id),  
    INDEX idx\_owner\_id (owner\_id),  
    INDEX idx\_status (status),  
    INDEX idx\_access\_type (access\_type),  
    UNIQUE INDEX uniq\_company\_name (company\_id, name),  
      
    \-- Constraints  
    CONSTRAINT chk\_name\_not\_empty CHECK (LENGTH(TRIM(name)) \> 0),  
    CONSTRAINT fk\_workspace\_company FOREIGN KEY (company\_id)   
        REFERENCES companies(id) ON DELETE CASCADE,  
    CONSTRAINT fk\_workspace\_owner FOREIGN KEY (owner\_id)   
        REFERENCES users(id) ON DELETE RESTRICT,  
    CONSTRAINT fk\_workspace\_workflow FOREIGN KEY (default\_workflow\_id)   
        REFERENCES workflows(id) ON DELETE RESTRICT  
);

\-- \============================================================  
\-- TABLE: workspace\_users (Many-to-Many: Workspaces & Users)  
\-- Descrição: Relacionamento entre usuários e workspaces  
\-- \============================================================  
CREATE TABLE workspace\_users (  
    id BIGINT PRIMARY KEY AUTO\_INCREMENT,  
      
    workspace\_id BIGINT NOT NULL REFERENCES workspaces(id),  
    user\_id BIGINT NOT NULL REFERENCES users(id),  
      
    \-- Permissões  
    role ENUM('ADMIN', 'EDITOR', 'VIEWER') DEFAULT 'VIEWER',  
      
    \-- Status  
    status ENUM('ACTIVE', 'INVITED', 'INACTIVE') DEFAULT 'ACTIVE',  
    invited\_at TIMESTAMP NULLABLE,  
    accepted\_at TIMESTAMP NULLABLE,  
      
    \-- Configuração  
    is\_default\_workspace BOOLEAN DEFAULT FALSE,  
      
    \-- Auditoria  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    created\_by BIGINT NOT NULL REFERENCES users(id),  
    updated\_at TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,  
      
    \-- Constraints & Indexação  
    UNIQUE KEY uniq\_workspace\_user (workspace\_id, user\_id),  
    INDEX idx\_workspace\_id (workspace\_id),  
    INDEX idx\_user\_id (user\_id),  
    INDEX idx\_role (role),  
    INDEX idx\_status (status),  
      
    CONSTRAINT fk\_wu\_workspace FOREIGN KEY (workspace\_id)   
        REFERENCES workspaces(id) ON DELETE CASCADE,  
    CONSTRAINT fk\_wu\_user FOREIGN KEY (user\_id)   
        REFERENCES users(id) ON DELETE CASCADE,  
    CONSTRAINT fk\_wu\_created\_by FOREIGN KEY (created\_by)   
        REFERENCES users(id)  
);

\-- \============================================================  
\-- TABLE: workspace\_tags (Many-to-Many: Workspaces & Tags)  
\-- Descrição: Tags para organização de workspaces  
\-- \============================================================  
CREATE TABLE workspace\_tags (  
    id BIGINT PRIMARY KEY AUTO\_INCREMENT,  
    workspace\_id BIGINT NOT NULL REFERENCES workspaces(id),  
    tag\_id BIGINT NOT NULL REFERENCES tags(id),  
      
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
      
    UNIQUE KEY uniq\_workspace\_tag (workspace\_id, tag\_id),  
    INDEX idx\_workspace\_id (workspace\_id),  
    INDEX idx\_tag\_id (tag\_id),  
      
    CONSTRAINT fk\_wt\_workspace FOREIGN KEY (workspace\_id)   
        REFERENCES workspaces(id) ON DELETE CASCADE,  
    CONSTRAINT fk\_wt\_tag FOREIGN KEY (tag\_id)   
        REFERENCES tags(id) ON DELETE CASCADE  
);

\-- \============================================================  
\-- TABLE: workspace\_permissions (Custom Permissions)  
\-- Descrição: Permissões customizadas quando access\_type \= CUSTOM  
\-- \============================================================  
CREATE TABLE workspace\_permissions (  
    id BIGINT PRIMARY KEY AUTO\_INCREMENT,  
    workspace\_id BIGINT NOT NULL REFERENCES workspaces(id),  
      
    \-- Quem tem permissão (pode ser user ou group)  
    principal\_type ENUM('USER', 'GROUP', 'SQUAD') NOT NULL,  
    principal\_id BIGINT NOT NULL,  
      
    \-- Quais permissões  
    can\_view BOOLEAN DEFAULT FALSE,  
    can\_create\_project BOOLEAN DEFAULT FALSE,  
    can\_edit\_workspace BOOLEAN DEFAULT FALSE,  
    can\_manage\_users BOOLEAN DEFAULT FALSE,  
    can\_manage\_access BOOLEAN DEFAULT FALSE,  
    can\_delete\_workspace BOOLEAN DEFAULT FALSE,  
      
    \-- Auditoria  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    created\_by BIGINT NOT NULL REFERENCES users(id),  
    updated\_at TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,  
      
    \-- Constraints  
    INDEX idx\_workspace\_id (workspace\_id),  
    INDEX idx\_principal (principal\_type, principal\_id),  
    UNIQUE KEY uniq\_workspace\_principal (workspace\_id, principal\_type, principal\_id),  
      
    CONSTRAINT fk\_wp\_workspace FOREIGN KEY (workspace\_id)   
        REFERENCES workspaces(id) ON DELETE CASCADE  
);

\-- \============================================================  
\-- TABLE: workspace\_audit\_log (Auditoria completa)  
\-- Descrição: Log de todas as mudanças em workspaces  
\-- \============================================================  
CREATE TABLE workspace\_audit\_log (  
    id BIGINT PRIMARY KEY AUTO\_INCREMENT,  
    workspace\_id BIGINT NOT NULL REFERENCES workspaces(id),  
      
    \-- O que foi feito  
    action ENUM('CREATE', 'UPDATE', 'DELETE', 'STATUS\_CHANGE',   
                'USER\_ADDED', 'USER\_REMOVED', 'PERMISSION\_CHANGED') NOT NULL,  
      
    \-- Detalhes da mudança  
    old\_values JSON NULLABLE,  
    new\_values JSON NULLABLE,  
      
    \-- Quem fez  
    performed\_by BIGINT NOT NULL REFERENCES users(id),  
      
    \-- Quando  
    performed\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
      
    \-- Contexto  
    ip\_address VARCHAR(45) NULLABLE,  
    user\_agent TEXT NULLABLE,  
      
    \-- Indexação  
    INDEX idx\_workspace\_id (workspace\_id),  
    INDEX idx\_action (action),  
    INDEX idx\_performed\_at (performed\_at),  
    INDEX idx\_performed\_by (performed\_by)  
);

\-- \============================================================  
\-- TABLE: workspace\_snapshots (Para recovery/backup)  
\-- Descrição: Snapshots da configuração do workspace  
\-- \============================================================  
CREATE TABLE workspace\_snapshots (  
    id BIGINT PRIMARY KEY AUTO\_INCREMENT,  
    workspace\_id BIGINT NOT NULL REFERENCES workspaces(id),  
      
    \-- Dados capturados  
    workspace\_data JSON NOT NULL,  
      
    \-- Tipo de snapshot  
    snapshot\_type ENUM('MANUAL', 'AUTOMATIC') DEFAULT 'AUTOMATIC',  
      
    \-- Quem criou  
    created\_by BIGINT NOT NULL REFERENCES users(id),  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
      
    \-- Retenção  
    expires\_at TIMESTAMP NULLABLE,  
      
    \-- Indexação  
    INDEX idx\_workspace\_id (workspace\_id),  
    INDEX idx\_created\_at (created\_at),  
    INDEX idx\_snapshot\_type (snapshot\_type),  
      
    CONSTRAINT fk\_ws\_workspace FOREIGN KEY (workspace\_id)   
        REFERENCES workspaces(id) ON DELETE CASCADE  
);

\-- \============================================================  
\-- TABLE: workspace\_activity\_log (Para analytics)  
\-- Descrição: Log de atividades (criação de proj/tarefas)  
\-- \============================================================  
CREATE TABLE workspace\_activity\_log (  
    id BIGINT PRIMARY KEY AUTO\_INCREMENT,  
    workspace\_id BIGINT NOT NULL REFERENCES workspaces(id),  
      
    \-- Tipo de atividade  
    activity\_type ENUM('PROJECT\_CREATED', 'TASK\_CREATED', 'TASK\_COMPLETED',  
                       'USER\_JOINED', 'FILE\_UPLOADED', 'COMMENT\_ADDED') NOT NULL,  
      
    \-- Referências  
    related\_entity\_type VARCHAR(50),  
    related\_entity\_id BIGINT,  
      
    \-- Quem fez  
    user\_id BIGINT NOT NULL REFERENCES users(id),  
      
    \-- Quando  
    activity\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
      
    \-- Indexação  
    INDEX idx\_workspace\_id (workspace\_id),  
    INDEX idx\_activity\_type (activity\_type),  
    INDEX idx\_activity\_at (activity\_at),  
    INDEX idx\_user\_id (user\_id)  
);

\-- \============================================================  
\-- VIEWS ÚTEIS (para queries comuns)  
\-- \============================================================

\-- View: Workspaces com contagem de usuários  
CREATE VIEW vw\_workspace\_user\_count AS  
SELECT   
    w.id,  
    w.name,  
    w.company\_id,  
    w.status,  
    COUNT(DISTINCT wu.user\_id) AS active\_users,  
    COUNT(DISTINCT CASE WHEN wu.status \= 'INVITED' THEN wu.user\_id END) AS invited\_users  
FROM workspaces w  
LEFT JOIN workspace\_users wu ON w.id \= wu.workspace\_id  
GROUP BY w.id, w.name, w.company\_id, w.status;

\-- View: Workspaces com contagem de projetos  
CREATE VIEW vw\_workspace\_project\_count AS  
SELECT   
    w.id,  
    w.name,  
    COUNT(DISTINCT p.id) AS total\_projects,  
    COUNT(DISTINCT CASE WHEN p.status \= 'ACTIVE' THEN p.id END) AS active\_projects,  
    COUNT(DISTINCT t.id) AS total\_tasks  
FROM workspaces w  
LEFT JOIN projects p ON w.id \= p.workspace\_id  
LEFT JOIN tasks t ON p.id \= t.project\_id  
GROUP BY w.id, w.name;

\-- View: User workspace access summary  
CREATE VIEW vw\_user\_workspace\_access AS  
SELECT   
    u.id,  
    u.name,  
    u.email,  
    COUNT(DISTINCT wu.workspace\_id) AS workspace\_count,  
    GROUP\_CONCAT(DISTINCT w.name) AS workspace\_names,  
    GROUP\_CONCAT(DISTINCT wu.role) AS roles  
FROM users u  
LEFT JOIN workspace\_users wu ON u.id \= wu.user\_id AND wu.status \= 'ACTIVE'  
LEFT JOIN workspaces w ON wu.workspace\_id \= w.id  
GROUP BY u.id, u.name, u.email;

\-- \============================================================  
\-- ÍNDICES PARA PERFORMANCE  
\-- \============================================================

\-- Para busca rápida de workspaces por empresa  
CREATE INDEX idx\_ws\_company\_status   
ON workspaces(company\_id, status);

\-- Para verificar acesso rápido de usuário  
CREATE INDEX idx\_wu\_user\_role   
ON workspace\_users(user\_id, workspace\_id, role);

\-- Para auditoria por data  
CREATE INDEX idx\_audit\_date\_range   
ON workspace\_audit\_log(workspace\_id, performed\_at DESC);

\-- Para analytics  
CREATE INDEX idx\_activity\_date   
ON workspace\_activity\_log(workspace\_id, activity\_at DESC);  
\`\`\`

\---

\#\# 13\. TRATAMENTO DE ERROS E VALIDAÇÃO

\*\*Matriz de Validações e Mensagens de Erro:\*\*

\`\`\`  
┌────────────────────────────────────────────────────────────────────┐  
│         VALIDAÇÕES E TRATAMENTO DE ERROS                           │  
├────────────────────────────────────────────────────────────────────┤  
│                                                                     │  
│ VALIDAÇÃO 1: Campo "Nome" Obrigatório                              │  
│ ─────────────────────────────────────────────────────────────────  │  
│ Tipo de Erro: Validation Error (400 Bad Request)                  │  
│ Trigger: Usuário tenta salvar workspace sem nome                  │  
│ Validação:                                                          │  
│   ├─ Não vazio (required)                                         │  
│   ├─ Não é apenas espaços em branco                               │  
│   ├─ Comprimento: Min 3, Max 100 caracteres                       │  
│   └─ Caracteres inválidos: \< \> " ' ; detecta                      │  
│                                                                     │  
│ Mensagens de Erro:                                                 │  
│   ├─ Campo vazio: "Nome do workspace é obrigatório"              │  
│   ├─ Muito curto: "Nome deve ter no mínimo 3 caracteres"         │  
│   ├─ Muito longo: "Nome pode ter no máximo 100 caracteres"       │  
│   └─ Caracteres inválidos: "Nome contém caracteres não permitidos"│  
│                                                                     │  
│ Feedback em Real-time:                                             │  
│   ├─ Enquanto digita: ✓ verde se válido, ✗ vermelho se inválido  │  
│   ├─ Tooltip helper: mostra regra que está violando              │  
│   └─ Botão Salvar: ✗ disabled até ser válido                     │  
│                                                                     │  
│ ─────────────────────────────────────────────────────────────────  │  
│                                                                     │  
│ VALIDAÇÃO 2: Campo "Nome" Deve Ser Único                           │  
│ ─────────────────────────────────────────────────────────────────  │  
│ Tipo de Erro: Conflict Error (409 Conflict)                       │  
│ Trigger: Usuário tenta criar workspace com nome existente         │  
│ Validação:                                                          │  
│   ├─ Query: SELECT COUNT(\*) FROM workspaces                       │  
│   │          WHERE name \= ? AND company\_id \= ?                    │  
│   └─ Se count \> 0: ERRO                                            │  
│                                                                     │  
│ Mensagem de Erro:                                                  │  
│   "Um workspace com o nome 'Marketing' já existe nesta empresa.    │  
│    Escolha outro nome ou edite o workspace existente."            │  
│                                                                     │  
│ Sugestões Automáticas:                                             │  
│   ├─ "Marketing 2"                                                 │  
│   ├─ "Marketing \- Novo"                                            │  
│   ├─ "Marketing 2024"                                              │  
│   └─ Campos pré-preenchidos com sugestão                          │  
│                                                                     │  
│ ─────────────────────────────────────────────────────────────────  │  
│                                                                     │  
│ VALIDAÇÃO 3: Campo "Proprietário" Deve Existir                     │  
│ ─────────────────────────────────────────────────────────────────  │  
│ Tipo de Erro: Reference Error (422 Unprocessable Entity)          │  
│ Trigger: Usuário seleciona proprietário inválido/deletado         │  
│ Validação:                                                          │  
│   ├─ User existe: SELECT id FROM users WHERE id \= ?               │  
│   ├─ User é ativo: WHERE status \= 'ACTIVE'                        │  
│   ├─ User não foi deletado: WHERE deleted\_at IS NULL             │  
│   └─ User tem permissão na empresa: company\_id match              │  
│                                                                     │  
│ Mensagem de Erro:                                                  │  
│   "Proprietário selecionado não existe ou foi removido.            │  
│    Selecione um usuário válido e ativo."                          │  
│                                                                     │  
│ ─────────────────────────────────────────────────────────────────  │  
│                                                                     │  
│ VALIDAÇÃO 4: Fluxo de Trabalho Deve Existir e Estar Ativo         │  
│ ─────────────────────────────────────────────────────────────────  │  
│ Tipo de Erro: Reference Error (422)                               │  
│ Trigger: Fluxo selecionado não existe ou foi deletado            │  
│ Validação:                                                          │  
│   ├─ Workflow existe: SELECT id FROM workflows WHERE id \= ?        │  
│   ├─ Status é ativo: WHERE status \= 'ACTIVE'                      │  
│   └─ Workspace match: WHERE workspace\_id \= ?                      │  
│                                                                     │  
│ Mensagem de Erro:                                                  │  
│   "Fluxo de Trabalho selecionado não está disponível.              │  
│    Crie um novo fluxo ou selecione um existente."                 │  
│                                                                     │  
│ ─────────────────────────────────────────────────────────────────  │  
│                                                                     │  
│ VALIDAÇÃO 5: Squad Deve Existir (se informado)                     │  
│ ─────────────────────────────────────────────────────────────────  │  
│ Tipo de Erro: Reference Error (422)                               │  
│ Trigger: Squad selecionado não existe                             │  
│ Validação:                                                          │  
│   ├─ Se squad\_id é NULL: OK (opcional)                            │  
│   └─ Se squad\_id tem valor:                                        │  
│      ├─ Squad existe                                               │  
│      ├─ Squad está ativo                                           │  
│      └─ Squad pertence a este workspace                            │  
│                                                                     │  
│ Mensagem de Erro:                                                  │  
│   "Squad selecionado não existe ou foi removido."                 │  
│                                                                     │  
│ ─────────────────────────────────────────────────────────────────  │  
│                                                                     │  
│ VALIDAÇÃO 6: Tipo de Acesso Válido                                 │  
│ ─────────────────────────────────────────────────────────────────  │  
│ Tipo de Erro: Validation Error (400)                              │  
│ Trigger: Tipo de acesso inválido (fora do enum)                  │  
│ Validação:                                                          │  
│   └─ access\_type IN ('EVERYONE', 'TEAM\_ONLY', 'PRIVATE', 'CUSTOM')│  
│                                                                     │  
│ Mensagem de Erro:                                                  │  
│   "Tipo de acesso inválido. Escolha: Todos, Equipe, Privado."   │  
│                                                                     │  
│ ─────────────────────────────────────────────────────────────────  │  
│                                                                     │  
│ VALIDAÇÃO 7: Status Válido                                         │  
│ ─────────────────────────────────────────────────────────────────  │  
│ Tipo de Erro: Validation Error (400)                              │  
│ Trigger: Status inválido                                          │  
│ Validação:                                                          │  
│   └─ status IN ('ACTIVE', 'INACTIVE')                              │  
│                                                                     │  
│ ─────────────────────────────────────────────────────────────────  │  
│                                                                     │  
│ VALIDAÇÃO 8: Tags Devem Existir                                    │  
│ ─────────────────────────────────────────────────────────────────  │  
│ Tipo de Erro: Reference Error (422)                               │  
│ Trigger: Uma das tags selecionadas não existe                     │  
│ Validação:                                                          │  
│   └─ Para cada tag\_id: SELECT id FROM tags WHERE id \= ?           │  
│      └─ Se alguma tag não existe: ERRO                            │  
│                                                                     │  
│ Mensagem de Erro:                                                  │  
│   "Uma ou mais tags selecionadas não existem. Atualize a lista."  │  
│                                                                     │  
│ ─────────────────────────────────────────────────────────────────  │  
│                                                                     │  
│ ERRO 1: Não Pode Deletar Workspace com Projetos Ativos             │  
│ ─────────────────────────────────────────────────────────────────  │  
│ Tipo: Business Logic Error (400 Bad Request)                      │  
│ Trigger: Usuário clica delete em workspace com projetos           │  
│ Validação:                                                          │  
│   ├─ Pre-delete check:                                             │  
│   │  SELECT COUNT(\*) FROM projects                                │  
│   │  WHERE workspace\_id \= ? AND status \!= 'DELETED'               │  
│   └─ Se count \> 0: BLOQUEIA DELEÇÃO                               │  
│                                                                     │  
│ Mensagem de Erro:                                                  │  
│   "Não é possível deletar este workspace porque ele contém        │  
│    3 projetos ativos. Por favor:                                  │  
│    1\. Arquive ou delete os projetos primeiro                      │  
│    2\. Ou desative o workspace (não remove dados)                  │  
│    Projetos a resolver: 'Campanha Q3', 'Website redesign', ..."  │  
│                                                                     │  
│ Opções Oferecidas:                                                 │  
│   ├─ \[Cancelar\] \- volta ao form                                   │  
│   ├─ \[Desativar Workspace\] \- ativa em vez de deletar              │  
│   └─ \[Ver Projetos\] \- vai para módulo de Projetos                │  
│                                                                     │  
│ ─────────────────────────────────────────────────────────────────  │  
│                                                                     │  
│ ERRO 2: Não Pode Deletar Workspace Padrão                          │  
│ ─────────────────────────────────────────────────────────────────  │  
│ Tipo: Business Logic Error (400)                                  │  
│ Trigger: Usuário tenta deletar workspace "Padrão"                │  
│ Validação:                                                          │  
│   └─ IF workspace.name \= 'Padrão' AND delete\_action: BLOQUEIA     │  
│                                                                     │  
│ Mensagem de Erro:                                                  │  
│   "O workspace 'Padrão' não pode ser deletado. Este é o espaço    │  
│    principal da sua empresa. Você pode:                           │  
│    \- Renomear este workspace                                      │  
│    \- Desativar este workspace                                     │  
│    \- Mas não pode deletá-lo                                       │  
│    Se quiser um novo workspace padrão, crie um novo e            │  
│    reassigne os usuários."                                        │  
│                                                                     │  
│ ─────────────────────────────────────────────────────────────────  │  
│                                                                     │  
│ ERRO 3: Limite de Workspaces Atingido                              │  
│ ─────────────────────────────────────────────────────────────────  │  
│ Tipo: Capacity/Quota Error (402 Payment Required ou 429\)          │  
│ Trigger: Empresa tentando criar 1001º workspace                   │  
│ Validação:                                                          │  
│   ├─ SELECT COUNT(\*) FROM workspaces                              │  
│   │  WHERE company\_id \= ?                                         │  
│   └─ If count \>= LIMIT (1000): BLOQUEIA                           │  
│                                                                     │  
│ Mensagem de Erro:                                                  │  
│   "Limite de workspaces atingido\!                                  │  
│    Sua empresa pode ter no máximo 1000 workspaces.                │  
│    Você já tem: 1000                                              │  
│                                                                    │  
│    Opções:                                                         │  
│    1\. Delete workspaces não usados                                │  
│    2\. Combine múltiplos workspaces em um                          │  
│    3\. Upgrade para plano Enterprise (limites maiores)"            │  
│                                                                     │  
│ ─────────────────────────────────────────────────────────────────  │  
│                                                                     │  
│ ERRO 4: Limite de Usuários por Workspace Atingido                  │  
│ ─────────────────────────────────────────────────────────────────  │  
│ Tipo: Capacity Error (429 Too Many Requests)                      │  
│ Trigger: Tentando adicionar usuário 501º ao workspace             │  
│ Validação:                                                          │  
│   ├─ SELECT COUNT(\*) FROM workspace\_users                         │  
│   │  WHERE workspace\_id \= ? AND status \= 'ACTIVE'                 │  
│   └─ If count \>= 500: BLOQUEIA                                    │  
│                                                                     │  
│ Mensagem de Erro:                                                  │  
│   "Limite de usuários para este workspace atingido\!                │  
│    Máximo: 500 usuários ativos                                    │  
│    Atual: 500                                                      │  
│                                                                     │  
│    Solução:                                                         │  
│    \- Remova usuários que não usam mais                            │  
│    \- Ou use Squads para granular acesso"                          │  
│                                                                     │  
│ ─────────────────────────────────────────────────────────────────  │  
│                                                                     │  
│ ERRO 5: Mudança de Tipo de Acesso Afetará Usuários                │  
│ ─────────────────────────────────────────────────────────────────  │  
│ Tipo: Warning/Confirmation (não é erro técnico)                   │  
│ Trigger: Usuário muda tipo de acesso (ex: Todos → Privado)       │  
│ Comportamento:                                                      │  
│   ├─ Sistema detecta mudança                                       │  
│   ├─ Calcula impacto:                                              │  
│   │  ├─ "75 usuários vão perder acesso"                          │  
│   │  ├─ "3 usuários vão ganhar acesso"                           │  
│   │  └─ "Você pode reverter essa mudança depois"                 │  
│   └─ Pede confirmação antes de salvar                             │  
│                                                                     │  
│ Dialog de Confirmação:                                             │  
│   "Esta ação afetará 75 usuários\!                                  │  
│                                                                     │  
│    Mudança: TODOS → PRIVADO (mais restritivo)                    │  
│    \- 75 usuários perderão acesso (exceto owner/admin)             │  
│    \- Você poderá reverter depois                                  │  
│                                                                     │  
│    Tem certeza?"                                                   │  
│    \[Cancelar\] \[Confirmar mudança\]"                                │  
│                                                                     │  
│ ─────────────────────────────────────────────────────────────────  │  
│                                                                     │  
│ ERRO 6: Falha na Duplicação de Workspace                           │  
│ ─────────────────────────────────────────────────────────────────  │  
│ Tipo: Server Error (500 Internal Server Error)                    │  
│ Trigger: Erro durante a operação de duplicação                    │  
│ Causas Possíveis:                                                  │  
│   ├─ Database error                                                │  
│   ├─ Timeout (duplicação de muitos dados)                          │  
│   ├─ Storage full                                                  │  
│   └─ Permission denied                                             │  
│                                                                     │  
│ Mensagem de Erro:                                                  │  
│   "Erro ao duplicar workspace. Tente novamente mais tarde.         │  
│    Se o problema persistir, contate o suporte.                    │  
│    Erro ID: \[UUID\] (para logging)"                                │  
│                                                                     │  
│ Comportamento de Retry:                                            │  
│   ├─ Sistema tenta 3 vezes automaticamente                        │  
│   ├─ Se falhar: mostra opção de retry manual                      │  
│   └─ Se timeout: oferece background job (email quando pronto)     │  
│                                                                     │  
│ ─────────────────────────────────────────────────────────────────  │  
│                                                                     │  
│ ERRO 7: Workspace Já Deletado (Race Condition)                     │  
│ ─────────────────────────────────────────────────────────────────  │  
│ Tipo: Not Found Error (404 Not Found)                             │  
│ Trigger: Usuário A deleta workspace enquanto Usuário B tenta editar│  
│ Validação:                                                          │  
│   └─ Check deleted\_at IS NULL antes de cada operação             │  
│                                                                     │  
│ Mensagem de Erro:                                                  │  
│   "Este workspace foi deletado por outro usuário.                  │  
│    A página será recarregada."                                    │  
│                                                                     │  
│ Ação:                                                               │  
│   ├─ Força reload página                                           │  
│   ├─ Volta para lista de workspaces                               │  
│   └─ Mostra notificação suave (toast)                             │  
│                                                                     │  
│ ─────────────────────────────────────────────────────────────────  │  
│                                                                     │  
│ ERRO 8: Acesso Negado (Permission Denied)                          │  
│ ─────────────────────────────────────────────────────────────────  │  
│ Tipo: Authorization Error (403 Forbidden)                         │  
│ Trigger: Usuário sem permissão tenta editar/deletar               │  
│ Validação:                                                          │  
│   ├─ Check workspace\_users.role \= 'ADMIN'                         │  
│   └─ Se role \< permissão requerida: ERRO                          │  
│                                                                     │  
│ Mensagem de Erro:                                                  │  
│   "Você não tem permissão para realizar esta ação.                 │  
│    Role necessário: Admin                                          │  
│    Seu role: Editor                                               │  
│    Contate o administrador do workspace."                         │  
│                                                                     │  
│ ─────────────────────────────────────────────────────────────────  │  
│                                                                     │  
└────────────────────────────────────────────────────────────────────┘  
\`\`\`

\---

\#\# 14\. PERFORMANCE E LIMITAÇÕES DO SISTEMA

\*\*Limites de Sistema e Considerações de Performance:\*\*

\`\`\`  
┌────────────────────────────────────────────────────────────────────┐  
│        PERFORMANCE & SYSTEM LIMITS \- WORKSPACES                    │  
├────────────────────────────────────────────────────────────────────┤  
│                                                                     │  
│ LIMITE 1: Número de Workspaces por Empresa                         │  
│ ────────────────────────────────────────────────────────────────   │  
│ Limite Técnico: 1.000 workspaces por empresa                       │  
│ Limite Prático: \>100 pode causar lentidão                          │  
│ Limite de Performance: \>500 volta a ser lento                      │  
│                                                                     │  
│ Degradação de Performance:                                          │  
│ ├─ 10 workspaces:   Listagem \< 200ms    (excellent)              │  
│ ├─ 100 workspaces:  Listagem \< 500ms    (good)                   │  
│ ├─ 500 workspaces:  Listagem 1-2s       (acceptable)             │  
│ └─ 1000 workspaces: Listagem 2-5s       (slow) \+ paginação       │  
│                                                                     │  
│ Mitigações Automáticas:                                             │  
│ ├─ Acima de 500: paginação de 50 workspaces por página            │  
│ ├─ Lazy loading: carrega mais ao scroll                            │  
│ ├─ Search/filter: filtra antes de renderizar                      │  
│ └─ Caching: cache de 5 minutos da lista                           │  
│                                                                     │  
│ Ação se limite atingido:                                            │  
│ └─ Sistema bloqueia criação com mensagem:                          │  
│    "Limite de workspaces atingido (1000). Delete algum."          │  
│                                                                     │  
│ ────────────────────────────────────────────────────────────────   │  
│                                                                     │  
│ LIMITE 2: Número de Usuários por Workspace                         │  
│ ────────────────────────────────────────────────────────────────   │  
│ Limite Técnico: 500 usuários ativos por workspace                  │  
│ Limite de Performance: \>200 usuários \= lentidão                    │  
│                                                                     │  
│ Impactos:                                                           │  
│ ├─ Dropdown de responsáveis: carrega lista de usuários             │  
│   ├─ 50 usuários: instant (\< 100ms)                               │  
│   ├─ 200 usuários: slow (500ms+)                                  │  
│   ├─ 500 usuários: muito lento (1-2s) \+ requer search/filter     │  
│   └─ Solução: autocomplete com search                              │  
│                                                                     │  
│ ├─ Permissões por usuário: cálculo de ACL                          │  
│   ├─ 50 usuários: instant (\< 50ms)                                │  
│   ├─ 200 usuários: fast (100-200ms)                               │  
│   └─ 500 usuários: lento (500ms+)                                 │  
│                                                                     │  
│ ├─ Filtragem de usuários na interface:                             │  
│   └─ \>200 requer paginação ou search                               │  
│                                                                     │  
│ Recomendação:                                                       │  
│ └─ Se \>100 usuários: use Squads para granular acesso              │  
│    (em vez de todos em um workspace)                               │  
│                                                                     │  
│ ────────────────────────────────────────────────────────────────   │  
│                                                                     │  
│ LIMITE 3: Tamanho de Campo "Nome"                                  │  
│ ────────────────────────────────────────────────────────────────   │  
│ Máximo: 100 caracteres                                             │  
│ Excesso: Sistema trunca ou mostra erro                             │  
│                                                                     │  
│ Exemplos:                                                           │  
│ ✓ "Marketing" (9 chars)                                            │  
│ ✓ "Cliente ABC \- Marketing & Branding" (37 chars)                │  
│ ✗ "Marketing Campaign Q3 2024 \- International Expansion Initiative" │  
│   (\> 100, será rejeitado)                                          │  
│                                                                     │  
│ ────────────────────────────────────────────────────────────────   │  
│                                                                     │  
│ LIMITE 4: Número de Tags por Workspace                             │  
│ ────────────────────────────────────────────────────────────────   │  
│ Limite: Nenhum limite técnico aparente                             │  
│ Prático: \>20 tags torna interface confusa                          │  
│                                                                     │  
│ Performance de Tags:                                                │  
│ ├─ 5 tags: instant rendering                                      │  
│ ├─ 20 tags: still fast                                             │  
│ └─ 100+ tags: filtro fica lento (recomenda search)                │  
│                                                                     │  
│ ────────────────────────────────────────────────────────────────   │  
│                                                                     │  
│ LIMITE 5: Operações em Lote (Bulk)                                │  
│ ────────────────────────────────────────────────────────────────   │  
│ "Adicionar múltiplas workspaces":                                  │  
│ ├─ Limite por lote: 100 workspaces de uma vez                     │  
│ ├─ Se \>100: sistema split em múltiplos lotes                      │  
│ └─ Tempo estimado:                                                  │  
│    ├─ 10 workspaces: 5 segundos                                   │  
│    ├─ 50 workspaces: 15 segundos                                  │  
│    ├─ 100 workspaces: 30 segundos                                 │  
│    └─ 1000 workspaces: background job (email quando pronto)       │  
│                                                                     │  
│ "Convidar múltiplos usuários":                                     │  
│ ├─ Limite por lote: 100 usuários de uma vez                       │  
│ ├─ Acima: offered background invitation job                       │  
│ └─ Notificações: enviadas em lotes de 50                          │  
│                                                                     │  
│ ────────────────────────────────────  
