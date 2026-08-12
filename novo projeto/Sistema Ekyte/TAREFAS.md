\# 📋 \*\*ANÁLISE PROFUNDA: MÓDULO "TAREFAS" (Tasks)\*\*

Perfeito\! Consegui explorar o sistema e entendo agora por que não conseguimos criar tarefas diretamente \- \*\*não existe um Fluxo de Trabalho ativo\*\*. Isso confirma exatamente a hierarquia que documentei. Vou criar uma análise \*\*extremamente detalhada\*\* do módulo TAREFAS:

\---

\#\# \*\*1. O QUE É "TAREFAS"\*\*

\*\*Tarefas (Tasks)\*\* é o \*\*coração do sistema eKyte\*\*. É onde a \*\*execução real do trabalho\*\* acontece.

\*\*Analogia:\*\*  
\`\`\`  
Se um Fluxo de Trabalho é como um "processo" de fabricação,  
e Tipos de Tarefa são "categorias de produto",  
então TAREFAS são os "produtos sendo fabricados agora".

Exemplo:  
Fluxo: "Desenvolvimento" (Backlog → Progresso → Concluído)  
Tipo:  "Feature" (tipo de produto)  
Tarefa: "Implementar login com 2FA" (produto específico em fabricação)  
\`\`\`

\*\*Importância:\*\*  
\- ✅ \*\*Onde o trabalho acontece\*\* \- é aqui que pessoas registram, atualizam e concluem trabalho  
\- 📊 \*\*Rastreamento\*\* \- permite visualizar progresso em tempo real  
\- 👥 \*\*Colaboração\*\* \- comentários, participantes, histórico  
\- 📈 \*\*Produtividade\*\* \- base para todos os relatórios e métricas  
\- ⚡ \*\*Automação\*\* \- dispara ações automáticas quando status muda

\---

\#\# \*\*2. ESTRUTURA DA PÁGINA \- VISTA LISTA\*\*

\`\`\`  
┌────────────────────────────────────────────────────────┐  
│ CONTROLE DE TAREFAS (lista)                            │  
├────────────────────────────────────────────────────────┤  
│                                                        │  
│ 🎯 FILTROS RÁPIDOS (inline):                          │  
│  ├─ Workspace: \[Todas ▼\]                              │  
│  ├─ Executor: \[Eliezer Trombini ▼\]                    │  
│  ├─ Participante: \[Todos ▼\]                           │  
│  ├─ Squad: \[Todos ▼\]                                  │  
│  ├─ Fluxo: \[Todos ▼\]                                  │  
│  ├─ Tags: \[Todas ▼\]                                   │  
│  ├─ Situação: \[Ativas ▼\]                              │  
│  └─ Mais Filtros ▼                                    │  
│     └─ Data (Até hoje, Período, Intervalo)           │  
│                                                        │  
│ 📑 VISUALIZAÇÕES:                                      │  
│  \[LISTA\] \[KANBAN\] \[CALENDÁRIO\] \[GANTT\] \[WORKLOAD\]    │  
│                                                        │  
│ 🎮 CONTROLES:                                          │  
│  ├─ Agrupar por: \[selector\]                          │  
│  ├─ Buscar tarefas:  \[search\_box\]                     │  
│  ├─ \[Mostrar/ocultar colunas\]                         │  
│  ├─ \[Exportar Excel\] \[Salvar PDF\]                     │  
│  └─ \[Outras ações...\]                                │  
│                                                        │  
│ 📊 TABELA:                                            │  
│ ┌─┬────┬──────┬────────┬──────┬────────────────────┐ │  
│ │☐│Id  │ Sit. │Tarefa  │Etapa │ Executor │ Datas  │ │  
│ ├─┼────┼──────┼────────┼──────┼────────────────────┤ │  
│ │ │    │      │        │      │                    │ │  
│ │ │ Nenhum resultado encontrado                     │ │  
│ │ │    │      │        │      │                    │ │  
│ └─┴────┴──────┴────────┴──────┴────────────────────┘ │  
│                                                        │  
│ \[+ Adicionar tarefa\]                                  │  
│                                                        │  
└────────────────────────────────────────────────────────┘  
\`\`\`

\*\*Colunas da Tabela:\*\*

| Coluna | Tipo | Função |  
|--------|------|--------|  
| \*\*Checkbox\*\* | Input | Selecionar múltiplas tarefas |  
| \*\*Id\*\* | Text | ID único da tarefa |  
| \*\*Sit. (Situação)\*\* | Icon | Status: Ativa (🟢), Concluída (✓), Cancelada (✗) |  
| \*\*Tarefa\*\* | Link | Título/nome da tarefa (clicável para abrir detalhe) |  
| \*\*Workspace\*\* | Text | Qual workspace pertence |  
| \*\*Canal\*\* | Text | Origem (Manual, Email, Integração, etc) |  
| \*\*Etapa\*\* | Badge | Fase atual no fluxo (Backlog, Progresso, etc) |  
| \*\*Executor\*\* | Avatar | Quem está responsável |  
| \*\*Executar etapa até\*\* | Date | Prazo para concluir a etapa |  
| \*\*Concluir tarefa até\*\* | Date | Prazo final da tarefa |  
| \*\*Esforço\*\* | Number | Horas estimadas |  
| \*\*Prioridade\*\* | Badge | Alta 🔴 / Média 🟡 / Baixa 🟢 |  
| \*\*Origem\*\* | Text | Como foi criada (API, Web, Mobile, etc) |

\---

\#\# \*\*3. HIERARQUIA E RELACIONAMENTOS\*\*

\`\`\`  
┌────────────────────────────────────────────────────────────┐  
│                        EMPRESA                             │  
│                    (Kev Seguros)                           │  
└────────────┬─────────────────────────────────┬─────────────┘  
             │                                 │  
        ┌────▼────┐                        ┌───▼────┐  
        │WORKSPACE │                        │WORKSPACE│  
        │ Padrão  │                        │ Suporte │  
        └────┬────┘                        └────┬────┘  
             │                                 │  
        ┌────▼──────────────┐         ┌───────▼────┐  
        │FLUXO DE TRABALHO  │         │ FLUXO      │  
        │(Desenvolvimento)  │         │(Suporte)   │  
        └────┬──────────────┘         └───────┬────┘  
             │                                │  
    ┌────────┼────────────┬────────┐         │  
    │        │            │        │         │  
┌───▼──┐ ┌──▼───┐ ┌──────▼──┐ ┌──▼──┐    ┌─▼──┐  
│Fase1 │ │Fase2 │ │ Fase 3  │ │Fase4│    │F1  │  
│(...)  │ │(...)  │ │ (...)  │ │(...)│    │(...)│  
└───┬──┘ └──┬───┘ └──────┬──┘ └──┬──┘    └─┬──┘  
    │       │            │       │          │  
    │   ┌───┴────────────┴───┬───┴──────┐  │  
    │   │        TAREFAS     │          │  │  
    │   └───────────────────┬┘          │  │  
    │                       │           │  │  
    │          ┌────────────┼───────────┼──┴─────┐  
    │          │            │           │        │  
┌───▼──────┐ ┌─▼──────┐ ┌───▼────┐ ┌──▼──┐ ┌──▼──┐  
│ Tarefa A │ │Tarefa B│ │Tarefa C│ │Tar D│ │Tar E│  
│(Feature) │ │( Bug ) │ │( Doc ) │ │(...)│ │(...)│  
└──────────┘ └────────┘ └────────┘ └─────┘ └─────┘

CADA TAREFA TEM:  
├─ Título \+ Descrição  
├─ Tipo (Feature, Bug, Doc)  
├─ Fase atual (onde está no fluxo)  
├─ Responsável (executor)  
├─ Participantes (colaboradores)  
├─ Datas (criação, deadline, conclusão)  
├─ Prioridade (Alta/Média/Baixa)  
├─ Estimativa (horas/dias)  
├─ Comentários \+ Histórico  
├─ Checklists \+ Anexos  
└─ Tags \+ Relacionamentos  
\`\`\`

\---

\#\# \*\*4. FLUXO COMPLETO DE VIDA DE UMA TAREFA\*\*

\#\#\# \*\*FASE 1: CRIAÇÃO\*\*

\`\`\`  
┌──────────────────────────────────────────────────┐  
│ PASSO 1: User clica "+ Adicionar tarefa"        │  
│  ou usa atalho no menu flutuante                │  
└────────┬─────────────────────────────────────────┘  
         │  
┌────────▼──────────────────────────────────────────┐  
│ PASSO 2: Valida pré-requisitos                   │  
│  ✓ Tem workflow ativo?                           │  
│  ✓ Tem permissão de criar?                       │  
│  ✓ Workspace selecionado?                        │  
│                                                  │  
│  Se erro: mostra modal "Criar fluxo"             │  
│  Se OK: abre form de criação                     │  
└────────┬──────────────────────────────────────────┘  
         │  
┌────────▼──────────────────────────────────────────┐  
│ PASSO 3: FORM ABRE (pode ser modal ou sidebar)  │  
│                                                  │  
│ SEÇÃO 1: INFORMAÇÕES BÁSICAS                    │  
│  ├─ Título da tarefa: \[\_\_\_\_\_\_\_\_\_\_\_\_\_\]           │  
│  ├─ Descrição: \[\_\_\_\_\_\_\_\_\_\_\_\_\_\]                  │  
│  └─ Tipo: \[Bug ▼\] / \[Feature ▼\]                │  
│                                                  │  
│ SEÇÃO 2: CLASSIFICAÇÃO                          │  
│  ├─ Workspace: \[Padrão ▼\]                      │  
│  ├─ Fluxo: \[Desenvolvimento ▼\]                 │  
│  ├─ Etapa inicial: \[Backlog ▼\] (auto-select)  │  
│  └─ Tags: \[+ Adicionar tags\]                    │  
│                                                  │  
│ SEÇÃO 3: RESPONSABILIDADES                      │  
│  ├─ Responsável: \[Eliezer T. ▼\]                │  
│  ├─ Participantes: \[+ Adicionar\]                │  
│  └─ Squad: \[Nenhum ▼\]                          │  
│                                                  │  
│ SEÇÃO 4: DATAS E PRIORIDADE                     │  
│  ├─ Prioridade: \[Normal ▼\]                      │  
│  ├─ Data de início: \[\_\_\_/\_\_\_/\_\_\_\]               │  
│  ├─ Data de fim: \[\_\_\_/\_\_\_/\_\_\_\]                  │  
│  ├─ Estimativa: \[\_\_\] horas                      │  
│  └─ Projeto: \[+ Adicionar projeto\]              │  
│                                                  │  
│ SEÇÃO 5: DETALHES ADICIONAIS                    │  
│  ├─ Checklist: \[+ Adicionar checklist\]          │  
│  ├─ Anexos: \[+ Upload arquivo\]                  │  
│  └─ Link relacionado: \[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\]         │  
│                                                  │  
│ \[Salvar\] ou \[Salvar e abrir\] \[Cancelar\]        │  
└────────┬──────────────────────────────────────────┘  
         │  
┌────────▼──────────────────────────────────────────┐  
│ PASSO 4: Preenche campos obrigatórios            │  
│  ✓ Título (obrigatório)                          │  
│  ✓ Fluxo (obrigatório \- já tem default)          │  
│  ✓ Responsável (obrigatório)                     │  
│  ○ Descrição (opcional)                          │  
│  ○ Datas (opcional)                              │  
│  ○ Prioridade (opcional \- default: Normal)      │  
└────────┬──────────────────────────────────────────┘  
         │  
┌────────▼──────────────────────────────────────────┐  
│ PASSO 5: Clica "Salvar"                          │  
│  ├─ Valida campos obrigatórios                   │  
│  ├─ Insere no banco de dados                     │  
│  ├─ Gera ID único                                │  
│  ├─ Cria registro na fase inicial                │  
│  ├─ Registra criador \+ data/hora                 │  
│  ├─ Envia notificação ao responsável             │  
│  └─ Abre modal sucesso                           │  
└────────┬──────────────────────────────────────────┘  
         │  
┌────────▼──────────────────────────────────────────┐  
│ PASSO 6: TAREFA CRIADA ✓                         │  
│  ├─ Status: ATIVA                                │  
│  ├─ Etapa: Backlog (1ª fase)                     │  
│  ├─ Responsável: \[pessoa atribuída\]              │  
│  └─ Visível na lista                             │  
└──────────────────────────────────────────────────┘  
\`\`\`

\---

\#\#\# \*\*FASE 2: EXECUÇÃO E PROGRESSO\*\*

\`\`\`  
┌──────────────────────────────────────────────────┐  
│ EVENTO: Tarefa criada e começou o trabalho       │  
└────────┬─────────────────────────────────────────┘  
         │  
┌────────▼──────────────────────────────────────────┐  
│ 1\. RESPONSÁVEL INICIA O TRABALHO                 │  
│    └─ Clica tarefa → abre detalhe                │  
│    └─ Vê: título, descrição, comentários        │  
│    └─ Arrasta para "Em Progresso" (ou clica)    │  
└────────┬──────────────────────────────────────────┘  
         │  
┌────────▼──────────────────────────────────────────┐  
│ 2\. TRANSIÇÃO DE ETAPA                            │  
│    ├─ Sistema valida: "Pode passar de Backlog   │  
│    │  para Em Progresso?"                        │  
│    │  └─ SIM (próxima fase na ordem)             │  
│    │                                              │  
│    ├─ Registra:                                  │  
│    │  ├─ Data/hora da transição                  │  
│    │  ├─ Quem moveu                              │  
│    │  ├─ Tempo na fase anterior                  │  
│    │  └─ Reset do SLA (novo timing)              │  
│    │                                              │  
│    └─ Dispara eventos:                           │  
│       ├─ Enviar notificação ao responsável       │  
│       ├─ Notificar participantes                 │  
│       ├─ Registrar no histórico                  │  
│       └─ Atualizar dashboard                     │  
└────────┬──────────────────────────────────────────┘  
         │  
┌────────▼──────────────────────────────────────────┐  
│ 3\. COLABORAÇÃO                                    │  
│    ├─ Membro da equipe comenta:                  │  
│    │  "Precisamos mais detalhes sobre X"         │  
│    │  └─ @manda notificação criador              │  
│    │                                              │  
│    ├─ Criador responde:                          │  
│    │  "Adicionei arquivo anexado"                │  
│    │  └─ Todos participantes recebem notif       │  
│    │                                              │  
│    └─ Atualiza checklist interno:                │  
│       "☐ Req 1" → "☑ Req 1"                     │  
│       "☐ Req 2" → "☑ Req 2"                     │  
│       "☑ Req 3" → "☑ Req 3"                     │  
│       └─ 100% completo\!                          │  
└────────┬──────────────────────────────────────────┘  
         │  
┌────────▼──────────────────────────────────────────┐  
│ 4\. REVISÃO                                        │  
│    ├─ Move para "Code Review" (próxima fase)    │  
│    ├─ Automaticamente atribui ao revisor         │  
│    ├─ Revisor recebe notificação                 │  
│    │                                              │  
│    ├─ Revisor analisa:                           │  
│    │  \- Comentário: "Encontrei 2 issues"        │  
│    │  \- Volta para "Em Progresso"                │  
│    │  \- Dev corrige                              │  
│    │  \- Revisão novamente → APROVA ✓            │  
│    │                                              │  
│    └─ Registra tempo em cada etapa:             │  
│       \- Backlog: 2 dias                          │  
│       \- Progresso: 3 dias                        │  
│       \- Review: 1 dia                            │  
└────────┬──────────────────────────────────────────┘  
         │  
┌────────▼──────────────────────────────────────────┐  
│ 5\. CONCLUSÃO                                      │  
│    ├─ Move para "Concluído" (fase final)        │  
│    ├─ Status muda para "CONCLUÍDA" ✓             │  
│    ├─ Sistema registra:                          │  
│    │  ├─ Data/hora de conclusão                  │  
│    │  ├─ Tempo total (criação → conclusão)       │  
│    │  ├─ Quem concluiu                           │  
│    │  └─ Última etapa levou 1 dia                │  
│    │                                              │  
│    └─ Dispara ações:                             │  
│       ├─ Notificar todos envolvidos              │  
│       ├─ Atualizar métricas                      │  
│       ├─ Incluir em relatórios                   │  
│       └─ Arquivar (opcional)                     │  
└──────────────────────────────────────────────────┘  
\`\`\`

\---

\#\# \*\*5. CAMPOS DO FORMULÁRIO (Detalhado)\*\*

\#\#\# \*\*SEÇÃO 1: INFORMAÇÕES BÁSICAS\*\*

\#\#\#\# \*\*Campo: Título (Nome da Tarefa)\*\*  
\`\`\`  
Label: "Título da Tarefa"  
Type: Text Input  
Placeholder: "ex: Implementar login com 2FA, Corrigir bug na busca"  
Validation:  
  \- Required (obrigatório)  
  \- Min: 5 caracteres  
  \- Max: 200 caracteres  
  \- No validation: pode ter qualquer caractere  
Help Text: "Título único que descreve brevemente o trabalho"  
Impacto: Aparece em:  
  \- Título da tarefa em toda parte  
  \- Notificações  
  \- Relatórios  
  \- Kanban, Lista, Calendário  
\`\`\`

\#\#\#\# \*\*Campo: Descrição (Details)\*\*  
\`\`\`  
Label: "Descrição"  
Type: Rich Text Editor (pode ter formatação)  
Placeholder: "ex: Contexto detalhado da tarefa..."  
Validation:  
  \- Optional (não obrigatório)  
  \- Max: 10.000 caracteres  
Help Text: "Forneça contexto, requisitos, detalhes específicos"  
Recursos:  
  \- Formatação: Bold, Itálico, Listas, Títulos  
  \- @mention para mencionar pessoas  
  \- Links (URL format)  
  \- Emojis  
\`\`\`

\#\#\#\# \*\*Campo: Tipo de Tarefa\*\*  
\`\`\`  
Label: "Tipo"  
Type: Dropdown/Select  
Options: \[Bug\] \[Feature\] \[Documentação\] \[Tarefa\] \[Manutenção\] \[etc\]  
Default: Último tipo usado ou o primeiro  
Validation: Required (obrigatório)  
Help Text: "Classifique o tipo de trabalho"  
Relacionado com: "Tipos de Tarefa" configurados no admin  
Impacto:  
  \- Apareça em filtros  
  \- Ícone \+ cor no kanban  
  \- Agrupamento em relatórios  
\`\`\`

\---

\#\#\# \*\*SEÇÃO 2: CLASSIFICAÇÃO E ORGANIZAÇÃO\*\*

\#\#\#\# \*\*Campo: Workspace\*\*  
\`\`\`  
Label: "Workspace"  
Type: Dropdown/Select  
Options: Todos os workspaces do usuário  
Default: Workspace padrão ou último usado  
Validation: Required  
Help Text: "Selecione o workspace (área de trabalho)"  
Impacto:  
  \- Define isolamento de dados  
  \- Filtra tarefas por workspace  
  \- Controla acesso  
\`\`\`

\#\#\#\# \*\*Campo: Fluxo de Trabalho\*\*  
\`\`\`  
Label: "Fluxo de Trabalho" ou "Workflow"  
Type: Dropdown/Select  
Options: Todos os fluxos ativos do workspace  
Default: Fluxo padrão do workspace  
Validation: Required (obrigatório)  
Help Text: "Selecione qual processo/workflow esta tarefa segue"  
Critical: SEM FLUXO → NÃO PODE CRIAR TAREFA  
Impacto:  
  \- Define as fases que a tarefa passa  
  \- Determina o caminho do trabalho  
  \- Mostra SLA de cada etapa  
\`\`\`

\#\#\#\# \*\*Campo: Etapa Inicial\*\*  
\`\`\`  
Label: "Etapa" ou "Fase Inicial"  
Type: Dropdown/Select (Auto-populated)  
Options: Primeira etapa do fluxo selecionado  
Default: Primeira etapa (Backlog, To Do, etc)  
Validation: Read-only / Auto-filled  
Help Text: "Etapa é definida automaticamente pela primeira do fluxo"  
Impacto:  
  \- Tarefa começa aqui  
  \- Pode mudar depois  
  \- Timer SLA começa aqui  
\`\`\`

\#\#\#\# \*\*Campo: Tags\*\*  
\`\`\`  
Label: "Tags"  
Type: Multi-select / Autocomplete  
Options: Tags existentes (ou criar nova)  
Default: Nenhuma (opcional)  
Validation: Optional, Max 10 tags  
Help Text: "Adicione tags para melhor organização e busca"  
Exemplos: "Urgente", "Client-Feedback", "Technical-Debt"  
Impacto:  
  \- Filtragem  
  \- Agrupamento  
  \- Busca  
  \- Relatórios  
\`\`\`

\---

\#\#\# \*\*SEÇÃO 3: RESPONSABILIDADES\*\*

\#\#\#\# \*\*Campo: Responsável (Assignee)\*\*  
\`\`\`  
Label: "Responsável" ou "Atribuído a"  
Type: User Select / Autocomplete  
Options: Usuários ativos da empresa  
Default: Usuário logado (atual)  
Validation: Required (obrigatório)  
Help Text: "Quem é o principal responsável por este trabalho?"  
Restrições:  
  \- Só pode ser 1 responsável  
  \- Deve ser usuário ativo  
  \- Recebe notificações automáticas  
Impacto:  
  \- Aparece em "Meus Trabalhos"  
  \- Notificações  
  \- Filtros  
  \- Cálculo de produtividade  
\`\`\`

\#\#\#\# \*\*Campo: Participantes\*\*  
\`\`\`  
Label: "Participantes" ou "Colaboradores"  
Type: Multi-select / Autocomplete  
Options: Todos os usuários ativos  
Default: Nenhum (opcional)  
Validation: Optional, pode ter múltiplos  
Help Text: "Quem mais trabalha nesta tarefa?"  
Diferença do Responsável:  
  \- Responsável \= pessoa principal responsável  
  \- Participante \= pessoa que ajuda/colabora  
Impacto:  
  \- Recebem comentários/notificações  
  \- Aparecem no histórico  
  \- Contam para métricas de colaboração  
\`\`\`

\#\#\#\# \*\*Campo: Squad\*\*  
\`\`\`  
Label: "Squad" ou "Equipe"  
Type: Dropdown/Select  
Options: Squads criados na config  
Default: Nenhum (opcional)  
Validation: Optional  
Help Text: "Qual equipe dedicada trabalha nisso?"  
Função:  
  \- Agrupar tarefas por squad  
  \- Visualizar trabalho da squad  
  \- Métricas por squad  
\`\`\`

\---

\#\#\# \*\*SEÇÃO 4: TIMING E PRIORIDADE\*\*

\#\#\#\# \*\*Campo: Prioridade\*\*  
\`\`\`  
Label: "Prioridade"  
Type: Radio Button ou Dropdown  
Options:  
  \- 🔴 Crítica (bloqueante, emergência)  
  \- 🔴 Alta (importante, prazo curto)  
  \- 🟡 Normal / Média (padrão)  
  \- 🟢 Baixa (pode esperar)  
Default: Normal/Média  
Validation: Required  
Help Text: "Qual a urgência/importância desta tarefa?"  
Impacto:  
  \- Cores em visualizações  
  \- Ordenação de trabalho  
  \- Filtros  
  \- Alertas automáticos  
\`\`\`

\#\#\#\# \*\*Campo: Data de Início\*\*  
\`\`\`  
Label: "Data de Início" ou "Planned Start"  
Type: Date Picker  
Default: Hoje ou data do workspace padrão  
Validation: Optional  
Help Text: "Quando o trabalho deve começar?"  
Regras:  
  \- Pode ser no passado (data manual)  
  \- Pode ser no futuro (planejamento)  
Impacto:  
  \- Visível no Calendário  
  \- Gantt chart mostra timeline  
  \- Cálculo de tempo até início  
\`\`\`

\#\#\#\# \*\*Campo: Data de Término / Deadline\*\*  
\`\`\`  
Label: "Data de Término", "Deadline", "Prazo"  
Type: Date Picker  
Default: Vazio (opcional)  
Validation: Optional, deve ser \>= Data Início  
Help Text: "Quando isto deve estar concluído?"  
SLA vs Deadline:  
  \- SLA: limite por etapa (config do fluxo)  
  \- Deadline: limite total da tarefa  
Impacto:  
  \- Alerta se ultrapassar  
  \- Gantt mostra barra de tempo  
  \- Filtro "Tarefas Atrasadas"  
\`\`\`

\#\#\#\# \*\*Campo: Estimativa de Esforço\*\*  
\`\`\`  
Label: "Estimativa", "Esforço", "Horas"  
Type: Number Input  
Unit: Horas ou Dias (depende config)  
Default: 0 ou vazio  
Validation: Optional, \>= 0  
Help Text: "Quantas horas/dias estimados para completar?"  
Exemplos:  
  \- 4 (horas)  
  \- 2.5 (dias)  
  \- 40 (horas sprint)  
Impacto:  
  \- Visualiza em Kanban  
  \- Cálculo de workload  
  \- Relatório de capacidade  
  \- Burndown charts  
  \- Comparar estimado vs real  
\`\`\`

\---

\#\#\# \*\*SEÇÃO 5: RELACIONAMENTOS\*\*

\#\#\#\# \*\*Campo: Projeto\*\*  
\`\`\`  
Label: "Projeto"  
Type: Dropdown/Select ou Link  
Options: Projetos ativos  
Default: Nenhum (opcional)  
Validation: Optional  
Help Text: "A qual projeto esta tarefa pertence?"  
Função:  
  \- Agrupar tarefas em projeto  
  \- Visualização de projeto  
  \- Métricas por projeto  
Relacionamento:  
  \- 1 Tarefa → 1 Projeto (ou nenhum)  
  \- Mas 1 Projeto → Múltiplas tarefas  
\`\`\`

\#\#\#\# \*\*Campo: Tarefa Relacionada / Dependência\*\*  
\`\`\`  
Label: "Tarefas Relacionadas", "Bloqueante", "Depende de"  
Type: Task Multi-select / Link  
Default: Nenhuma (opcional)  
Validation: Optional  
Help Text: "Esta tarefa depende de outra ou é relacionada?"  
Tipos de Relacionamento:  
  \- Bloqueante: precisa que outra termine  
  \- Bloqueada por: está esperando outra  
  \- Relacionada: apenas informação  
Impacto:  
  \- Não deixa concluir se bloqueante não terminou  
  \- Visual de dependências no Gantt  
  \- Aviso no detail  
\`\`\`

\---

\#\#\# \*\*SEÇÃO 6: ADICIONAIS\*\*

\#\#\#\# \*\*Campo: Checklist\*\*  
\`\`\`  
Label: "Checklist" ou "Itens"  
Type: List com checkboxes  
Items: \[☐ Item 1\] \[☐ Item 2\] \[☐ Item 3\]  
Validation: Optional  
Help Text: "Adicione itens para rastrear progresso"  
Funcionalidade:  
  \- Adicionar item: \[+ Adicionar item\]  
  \- Marcar como feito: clica checkbox  
  \- Deletar: hover → delete icon  
  \- Reordenar: drag & drop  
Impacto:  
  \- Mostra % de progresso  
  \- Barra visual de conclusão  
  \- Notificação quando 100%  
\`\`\`

\#\#\#\# \*\*Campo: Anexos\*\*  
\`\`\`  
Label: "Arquivos", "Anexos", "Uploads"  
Type: Drag & Drop / File Input  
Max Files: 10-20 (depende config)  
Max Size: 100MB por arquivo  
Validation: Optional  
Tipos Suportados: .pdf, .doc, .xls, .png, .jpg, .zip, etc  
Help Text: "Arraste arquivos ou clique para upload"  
Função:  
  \- Armazenar arquivos relacionados  
  \- Versioning (se suportado)  
  \- Compartilhar com time  
  \- Histórico de uploads  
\`\`\`

\---

\#\# \*\*6. VISUALIZAÇÕES DE TAREFAS\*\*

\#\#\# \*\*6.1 VISTA LISTA\*\*  
\`\`\`  
Formato: Tabela tradicional com linhas e colunas  
Melhor para: Visão geral, busca, filtros avançados  
Colunas: Id, Situação, Tarefa, Workspace, Etapa, Executor, Datas  
Ações:  
  \- Clicar linha → abre detalhe  
  \- Drag & drop → não funciona (use Kanban)  
  \- Selecionar checkbox → ações em batch  
Ordenação:  
  \- Clica no header para ordenar  
  \- Permite sort por qualquer coluna (crescente/decrescente)  
Agrupamento:  
  \- Dropdown "Agrupar por": Etapa, Executor, Prioridade, etc  
  \- Colapsa/expande grupos  
\`\`\`

\#\#\# \*\*6.2 VISTA KANBAN\*\*  
\`\`\`  
Formato: Cards em colunas (vertical)  
Colunas: Uma coluna por etapa do fluxo  
Melhor para: Workflow visual, mover tarefas entre etapas

Estrutura:  
┌────────────────────────────────────────────────────┐  
│ 🔵 BACKLOG        │ 🟡 PROGRESSO    │ 🟢 CONCLUÍDO  │  
│                  │                 │               │  
│ ┌──────────────┐ │ ┌─────────────┐ │ ┌──────────┐  │  
│ │ Tarefa A     │ │ │ Tarefa C    │ │ │ Tarefa D │  │  
│ │ (2 dias)     │ │ │ (1 dia)     │ │ │ ✓        │  │  
│ │ 🔴 Alta      │ │ │ 🟡 Normal   │ │ └──────────┘  │  
│ └──────────────┘ │ └─────────────┘ │               │  
│                  │                 │ ┌──────────┐  │  
│ ┌──────────────┐ │ ┌─────────────┐ │ │ Tarefa E │  │  
│ │ Tarefa B     │ │ │ Tarefa F    │ │ │ ✓        │  │  
│ │ (5 dias)     │ │ │ (3 dias)    │ │ └──────────┘  │  
│ │ 🟡 Média     │ │ │ 🟡 Média    │ │               │  
│ └──────────────┘ │ └─────────────┘ │               │  
│                  │                 │               │  
└────────────────────────────────────────────────────┘

Ações:  
  \- Drag & drop card entre colunas \= mover etapa  
  \- Clicar card \= abre detalhe  
  \- Hover \= mostra opções (edit, delete)  
  \- Mostrar/ocultar colunas  
\`\`\`

\#\#\# \*\*6.3 VISTA CALENDÁRIO\*\*  
\`\`\`  
Formato: Calendário mensal com tarefas em datas  
Eixo: Tempo (datas)  
Melhor para: Ver tarefas por data, deadlines, timeline

Estrutura:  
┌─────────────────────────────────────────┐  
│ Aug 2026                                │  
├──────┬──────┬──────┬──────┬────────────┤  
│ Dom  │ Seg  │ Ter  │ Qua  │ ...        │  
├──────┼──────┼──────┼──────┼────────────┤  
│      │      │ 05   │ 06   │            │  
│      │      │ ■ T1 │ ■ T2 │            │  
├──────┼──────┼──────┼──────┼────────────┤  
│ 11   │ 12   │ 13   │ 14   │ 15         │  
│      │ ■ T3 │ ■ T4 │ ■ T5 │ ■ T6      │  
│      │      │ ■ T7 │      │ ■ T8      │  
├──────┼──────┼──────┼──────┼────────────┤  
│ 18   │ 19   │ 20   │ 21   │ 22         │  
│ ■ T9 │      │      │      │            │  
└──────┴──────┴──────┴──────┴────────────┘

Ações:  
  \- Clicar data → ver tarefas do dia  
  \- Clicar tarefa → abre detalhe  
  \- Arrastar tarefa entre datas \= muda deadline  
  \- Cores por prioridade/status  
\`\`\`

\#\#\# \*\*6.4 VISTA GANTT\*\*  
\`\`\`  
Formato: Gráfico de barras horizontais (timeline)  
Eixo X: Tempo  
Eixo Y: Tarefas  
Melhor para: Ver cronograma, dependências, timeline geral

Estrutura:  
Task │ Start    End      │Timeline  
─────┼──────────────────┼──────────────────────────  
T1   │ 08/01 \- 08/10   │ ▓▓▓▓▓▓▓▓▓▓  
T2   │ 08/05 \- 08/15   │     ▓▓▓▓▓▓▓▓▓▓▓  
T3   │ 08/16 \- 08/20   │           ▓▓▓▓▓  
T4   │ 08/10 \- 08/14   │      ▓▓▓▓▓ (bloqueante de T3)  
T5   │ 08/21 \- 08/25   │                ▓▓▓▓▓  
─────┴──────────────────┴──────────────────────────

Recursos:  
  \- Mostra dependências com linhas  
  \- Arrastar bar \= muda datas  
  \- Cores por status/prioridade  
  \- Zoom in/out para mais/menos detalhes  
\`\`\`

\#\#\# \*\*6.5 VISTA WORKLOAD\*\*  
\`\`\`  
Formato: Grid com pessoas vs dias/semanas  
Eixo X: Dias/Semanas  
Eixo Y: Pessoas (Executores)  
Melhor para: Ver carga de trabalho, balancear equipe

Estrutura:  
Executor    │ Week1  │ Week2  │ Week3  │ Week4  
────────────┼────────┼────────┼────────┼─────  
João        │ 25h    │ 32h    │ 40h ⚠️ │ 20h  
Maria       │ 15h    │ 18h    │ 22h    │ 35h ⚠️  
Pedro       │ 30h    │ 25h    │ 28h    │ 24h  
Sofia       │ 20h    │ 20h    │ 20h    │ 20h  
────────────┴────────┴────────┴────────┴─────

Cores:  
  \- Verde: capacidade normal (20-30h)  
  \- Amarelo: um pouco acima (30-40h)  
  \- Vermelho: overloaded (\>40h)

Ações:  
  \- Arrastar tarefa de um executor para outro \= reatribui  
  \- Clicar célula \= ver tarefas daquele período  
  \- Dica: permite balancear workload visualmente  
\`\`\`

\---

\#\# \*\*7. FILTROS AVANÇADOS\*\*

\`\`\`  
FILTROS RÁPIDOS (inline):  
  ├─ Workspace: todos / específico  
  ├─ Executor: pessoa / equipe  
  ├─ Participante: quem participa  
  ├─ Squad: grupo de trabalho  
  ├─ Fluxo: qual processo  
  ├─ Tags: etiquetas  
  ├─ Situação: Ativas / Concluídas / Canceladas  
  └─ Datas: Hoje /

**📋 ANÁLISE TAREFAS \- PARTES FALTANDO**

## **7\. FILTROS AVANÇADOS (COMPLETO)**

### **Filtros Rápidos (Inline)**

FILTROS INLINE (aparecem acima da tabela):  
┌─────────────────────────────────────────────────────┐  
│ Workspace: \[Todas ▼\]                                │  
│ Executor: \[Eliezer T. ▼\]                            │  
│ Participante: \[Todos ▼\]                             │  
│ Squad: \[Todos ▼\]                                    │  
│ Fluxo: \[Todos ▼\]                                    │  
│ Tags: \[Todas ▼\]                                     │  
│ Situação: \[Ativas ▼\]                                │  
│ \[Mais Filtros ▼\] \[Limpar Filtros\]                  │  
└─────────────────────────────────────────────────────┘

Cada filtro é independente e cumulativo:  
  \- Selecionar Workspace \= filtra por workspace  
  \- \+ Executor \= filtra workspace AND executor  
  \- \+ Situação \= filtra workspace AND executor AND status  
  └─ Resultado: apenas tarefas que atendem TODOS os critérios

### **Mais Filtros (Dropdown Avançado)**

Clica em "Mais Filtros" abre dropdown com opções adicionais:

├─ Data (fase) até:  
│  └─ Até hoje (etapa)  
│  └─ Próximos 7 dias  
│  └─ Próximos 30 dias  
│  └─ Personalizado \[Data Inicial\] \[Data Final\]  
│  
├─ Data de conclusão até:  
│  └─ Vencidas (ontem ou antes)  
│  └─ Vence hoje  
│  └─ Vence em breve (próximos 3 dias)  
│  └─ Próximos 7 dias  
│  └─ Próximos 30 dias  
│  └─ Sem prazo  
│  
├─ Prioridade:  
│  ☐ Crítica  
│  ☐ Alta  
│  ☐ Normal  
│  ☐ Baixa  
│  
├─ Estimativa:  
│  ☐ Sem estimativa  
│  ☐ 1-4 horas  
│  ☐ 1-3 dias  
│  ☐ 1-2 semanas  
│  ☐ \> 2 semanas  
│  
├─ Tipo de Tarefa:  
│  ☐ Bug  
│  ☐ Feature  
│  ☐ Documentação  
│  ☐ Tarefa  
│  ☐ \[etc \- todos os tipos\]  
│  
├─ Criador:  
│  \[Selecionar usuário\]  
│  
├─ Canal (origem):  
│  ☐ Manual  
│  ☐ Email  
│  ☐ API  
│  ☐ Integração  
│  
└─ Status:  
   ☐ Ativas  
   ☐ Concluídas  
   ☐ Canceladas  
   ☐ Arquivadas

### **Busca por Texto**

Campo de busca global:  
  \[🔍 Buscar tarefas...\]

Busca em:  
  \- Título da tarefa  
  \- Descrição (primeiras linhas)  
  \- ID da tarefa  
  \- Comentários (não busca conteúdo, só sabe que tem)  
  \- Tags (busca por nome)  
  \- Responsável (nome)

Comportamento:  
  \- Busca é AND com outros filtros  
  \- Caso-insensitivo  
  \- Busca parcial (ex: "login" encontra "2FA login")  
  \- Real-time (conforme digita)

Exemplos:  
  "login" → encontra tarefas com "login" no título  
  "2FA" → encontra tarefas relacionadas a 2FA  
  "\#123" → busca por ID específica

### **Salvar e Compartilhar Filtros**

SALVAR FILTRO:  
  Clica em "..." → "Salvar filtro"  
  ├─ Modal abre  
  ├─ Nome do filtro: \[\_\_\_\_\_\_\_\_\_\_\_\_\_\]  
  ├─ Descrição: \[\_\_\_\_\_\_\_\_\_\_\_\_\_\]  
  ├─ Privado / Público: \[●\] \[○\]  
  └─ \[Salvar\]

Uso:  
  \- Próxima vez clica no filtro salvo → aplica automaticamente  
  \- Dropdown mostra "Filtros salvos"  
  \- Pode ter múltiplos filtros salvos

COMPARTILHAR FILTRO:  
  Clica em "..." → "Compartilhar filtro"  
  └─ Cria link: ekyte.com/tasks?filter=abc123  
  └─ Pode compartilhar com time  
  └─ Quem abre \= vê mesmas tarefas com mesmo filtro  
---

## **8\. AÇÕES EM TAREFAS (DETALHADO)**

### **8.1 ABRIR UMA TAREFA (Detalhe)**

Quando clica em uma tarefa na lista, abre:

┌─────────────────────────────────────────────────────┐  
│ \[←\] TAREFA: Implementar login com 2FA       \[×\]    │  
├─────────────────────────────────────────────────────┤  
│                                                     │  
│ 🎯 INFORMAÇÕES PRINCIPAIS                          │  
│  ├─ ID: \#1234                                      │  
│  ├─ Status: 🟡 Em Progresso                        │  
│  ├─ Tipo: ⭐ Feature                               │  
│  ├─ Prioridade: 🔴 Alta                            │  
│  ├─ Criada: 10/08/2026 por Eliezer T.             │  
│  ├─ Última atualização: 11/08/2026 às 14:30       │  
│  └─ Tempo decorrido: 1 dia, 3 horas               │  
│                                                     │  
│ 📋 DESCRIÇÃO                                       │  
│  "Implementar autenticação 2FA usando TOTP.       │  
│   Integrar com app de autenticação do usuário.    │  
│   Considerar QR code para setup."                 │  
│                                                     │  
│ 👤 RESPONSABILIDADES                               │  
│  ├─ Responsável: João Silva                       │  
│  ├─ Participantes:                                │  
│  │  ├─ Maria (revisor)                            │  
│  │  └─ Pedro (QA)                                 │  
│  └─ Squad: Backend Team                           │  
│                                                     │  
│ 📅 DATAS E TIMING                                  │  
│  ├─ Criada: 10/08/2026                            │  
│  ├─ Início: 10/08/2026                            │  
│  ├─ Deadline: 15/08/2026                          │  
│  ├─ Dias restantes: 4 dias ⏰                      │  
│  ├─ Etapa atual: Em Progresso (1 dia nesta fase) │  
│  └─ SLA da etapa: 5 dias ✓                        │  
│                                                     │  
│ 📊 ESTIMATIVA E PROGRESSO                          │  
│  ├─ Estimado: 16 horas                            │  
│  ├─ Tempo gasto: 6 horas                          │  
│  ├─ Restante: 10 horas                            │  
│  ├─ Progresso: \[████████░░░░░░░░░░\] 37%          │  
│  └─ Checklist: 3/7 itens completos               │  
│                                                     │  
│ 🏷️ CLASSIFICAÇÃO                                   │  
│  ├─ Tags: \#backend, \#security, \#authentication   │  
│  ├─ Projeto: API Rest v2                          │  
│  ├─ Workspace: Padrão                             │  
│  ├─ Fluxo: Desenvolvimento                        │  
│  ├─ Etapa: Em Progresso                           │  
│  └─ Canal (Origem): Manual                        │  
│                                                     │  
│ 🔗 RELACIONAMENTOS                                 │  
│  ├─ Bloqueante de: \#1235, \#1236                  │  
│  ├─ Bloqueada por: \#1233                          │  
│  ├─ Relacionada com: \#1100, \#1101                │  
│  └─ \[+ Adicionar relacionamento\]                 │  
│                                                     │  
│ 📝 CHECKLIST                                       │  
│  ├─ ☑ Implement TOTP logic                        │  
│  ├─ ☑ Create QR code generator                    │  
│  ├─ ☐ Add email backup codes                      │  
│  ├─ ☐ Write unit tests                            │  
│  ├─ ☐ Write integration tests                     │  
│  ├─ ☐ Update API documentation                    │  
│  └─ ☐ Deploy to staging                           │  
│     \[+ Adicionar item\]                            │  
│                                                     │  
│ 📎 ANEXOS                                          │  
│  ├─ 2fa-design.pdf (1.2 MB) \- João Silva         │  
│  ├─ requirements.txt (5 KB) \- Maria              │  
│  └─ \[+ Upload arquivo\]                           │  
│                                                     │  
│ 💬 COMENTÁRIOS E HISTÓRICO                         │  
│  ├─ \[Ver comentários (5)\]                         │  
│  ├─ \[Ver histórico de mudanças\]                   │  
│  └─ \[Novo comentário...\]                         │  
│                                                     │  
│ 🎮 AÇÕES RÁPIDAS (topo do painel)                 │  
│  ├─ \[Editar\] \[Mover etapa\] \[Atribuir\]            │  
│  ├─ \[Mais opções ⋮\]                               │  
│  └─ └─ \[Duplicar\] \[Arquivar\] \[Deletar\]           │  
│                                                     │  
└─────────────────────────────────────────────────────┘

### **8.2 MUDAR ETAPA / STATUS**

OPÇÃO 1: Kanban (visual)  
  └─ Arrasta card de coluna para coluna  
  └─ Sistema pergunta: "Mover para Em Progresso?"  
  └─ \[Confirmar\] ou \[Cancelar\]

OPÇÃO 2: Clicka botão "Mover etapa"  
  └─ Dropdown mostra próximas fases válidas  
  └─ Ex: Em "Backlog" → \[Em Progresso\] \[Cancelada\]  
  └─ Seleciona → Confirma → Muda

OPÇÃO 3: Clicar na etapa no detalhe  
  └─ Abre dropdown com fases  
  └─ Seleciona → Muda instantaneamente

LÓGICA DE TRANSIÇÃO:  
  ├─ Pode ir para próxima fase sequencialmente  
  │  └─ Backlog → Em Progresso → Review → Concluído  
  │  └─ NÃO pode pular fases  
  │  
  ├─ Pode ir para QUALQUER fase final (terminal)  
  │  └─ De qualquer lugar → Cancelada/Concluído  
  │  
  ├─ Pode voltar para fase anterior (revert)  
  │  └─ Em Progresso → Backlog (se permitido)  
  │  
  └─ Ao transicionar:  
     ├─ Registra data/hora  
     ├─ Registra quem moveu  
     ├─ Calcula tempo na fase anterior  
     ├─ Inicia novo SLA na fase nova  
     └─ Notifica responsável \+ participantes

### **8.3 EDITAR TAREFA**

CAMPOS EDITÁVEIS:

Editáveis SEMPRE:  
  ├─ Título  
  ├─ Descrição  
  ├─ Prioridade  
  ├─ Estimativa  
  ├─ Data de deadline  
  ├─ Responsável (reatribuir)  
  ├─ Adicionar/remover participantes  
  ├─ Tags  
  ├─ Projeto  
  └─ Checklist (adicionar/remover itens)

NÃO Editáveis (apenas visualizar):  
  ├─ ID (gerado automaticamente)  
  ├─ Data de criação  
  ├─ Criador (quem criou)  
  ├─ Tipo de Tarefa (não pode mudar depois de criar)  
  ├─ Fluxo (não pode mudar depois de criar)  
  └─ Etapa (apenas via transição formal)

FLUXO DE EDIÇÃO:

1\. Clica em campo → entra em modo edit  
   └─ Campo fica destacado/editável

2\. Altera conteúdo

3\. Clica fora ou pressiona Enter  
   └─ Salva automaticamente  
   └─ Mostra "Salvando..." depois "Salvo ✓"

4\. Registra edição no histórico:  
   └─ "João Silva atualizou Prioridade de Normal para Alta"  
   └─ Data/hora registrada

RESTRIÇÕES DE EDIÇÃO POR PERMISSÃO:  
  └─ Visto em seção de Permissões (abaixo)

### **8.4 COMENTÁRIOS E DISCUSSÃO**

SEÇÃO DE COMENTÁRIOS:

┌─────────────────────────────────────────────────┐  
│ 💬 COMENTÁRIOS (5)                              │  
├─────────────────────────────────────────────────┤  
│                                                 │  
│ João Silva \- 10/08/2026 14:35                   │  
│ "Comecei a implementar. Vou usar bcryptjs para │  
│  gerar o secret TOTP."                         │  
│ \[Responder\] \[Editar\] \[Deletar\]                 │  
│                                                 │  
│   └─ Maria \- 10/08/2026 15:20 (resposta)      │  
│      "@João Ótimo\! Confirma que é compatível │  
│       com Google Authenticator?"               │  
│      \[Responder\] \[Editar\] \[Deletar\]            │  
│                                                 │  
│   └─ João \- 10/08/2026 15:45 (resposta)       │  
│      "@Maria Sim, testei e funciona perfeito" │  
│      \[Responder\] \[Editar\] \[Deletar\]            │  
│                                                 │  
│ Pedro \- 11/08/2026 09:00                        │  
│ "Quando tiver pronto, me avisa para testes"   │  
│ \[Responder\] \[Editar\] \[Deletar\]                 │  
│                                                 │  
│ Maria \- 11/08/2026 10:15                        │  
│ "@Pedro João diz que estaremos prontos amanhã"│  
│ \[Responder\] \[Editar\] \[Deletar\]                 │  
│                                                 │  
├─────────────────────────────────────────────────┤  
│ \[Novo comentário...\]                           │  
│ \[Tipo aqui\]                                    │  
│ \[@mencionar usuário\] \[Attach file\] \[Enviar\]   │  
└─────────────────────────────────────────────────┘

FUNCIONALIDADES:  
  ├─ @mention: "@João" notifica João  
  ├─ Notificações: everyone recebe notif se @ ou participa  
  ├─ Editar comentário: clica \[Editar\] → edit → salva  
  ├─ Deletar comentário: clica \[Deletar\] → confirm  
  ├─ Threads: respostas aninhadas (replies)  
  ├─ Emojis: pode usar emojis 😀  
  ├─ Markdown: suporta \*\*bold\*\*, \_itálico\_, etc  
  ├─ Links: reconhece URLs automaticamente  
  ├─ Arquivo: pode anexar no comentário  
  └─ Histórico: "Editado em 11/08 às 10:16" aparece

NOTIFICAÇÕES:  
  └─ Quando alguém comenta:  
     ├─ Responsável recebe notif  
     ├─ Participantes recebem notif  
     ├─ Se @mencionado, recebe notif extra  
     ├─ Se criador comentou, responsável vê  
     └─ Pode desabilitar notificações da tarefa

### **8.5 HISTÓRICO DE MUDANÇAS**

SEÇÃO DE HISTÓRICO:

┌──────────────────────────────────────────────┐  
│ 📜 HISTÓRICO (mostra todas as mudanças)      │  
├──────────────────────────────────────────────┤  
│                                              │  
│ 11/08/2026 14:30                             │  
│ João Silva moveu para "Em Progresso"        │  
│                                              │  
│ 11/08/2026 13:45                             │  
│ Maria Silva editou:                          │  
│  Prioridade: Normal → Alta                   │  
│  Estimativa: 12h → 16h                       │  
│                                              │  
│ 11/08/2026 10:20                             │  
│ Pedro adicionado como participante           │  
│                                              │  
│ 10/08/2026 16:00                             │  
│ João Silva criou tarefa                      │  
│  Título: "Implementar login com 2FA"         │  
│  Responsável: João Silva                     │  
│  Prioridade: Alta                            │  
│                                              │  
└──────────────────────────────────────────────┘

INFORMAÇÃO REGISTRADA:  
  ├─ Quem fez a mudança  
  ├─ Quando (data e hora exata)  
  ├─ O que mudou  
  ├─ Valor antes → Valor depois  
  ├─ Criação de tarefa  
  ├─ Transições de fase  
  ├─ Adição/remoção de responsável  
  ├─ Adição/remoção de participantes  
  ├─ Mudança de prioridade  
  ├─ Mudança de estimativa  
  ├─ Comentários (mostra quem e quando)  
  ├─ Checklist updates  
  ├─ Anexos (quem upload)  
  └─ Arquivamento/deleção

USO:  
  └─ Rastrear "por que isso mudou?"  
  └─ Auditoria de quem fez o quê  
  └─ Entender evolução da tarefa  
  └─ Reverter mudanças (se necessário)  
---

## **9\. SISTEMA DE PERMISSÕES EM TAREFAS**

### **Quem Pode Fazer O Quê:**

┌────────────────────────────────────────────────────┐  
│                  PERMISSÕES EM TAREFAS            │  
├────────────────────────────────────────────────────┤  
│                                                    │  
│ ADMIN (Administrador da empresa)                  │  
│  ✓ Ver todas as tarefas                          │  
│  ✓ Criar tarefas em qualquer workspace           │  
│  ✓ Editar qualquer tarefa                        │  
│  ✓ Deletar qualquer tarefa                       │  
│  ✓ Mover para qualquer etapa                     │  
│  ✓ Atribuir a qualquer pessoa                    │  
│  ✓ Arquivar/desarquivar                          │  
│  ✓ Ver comentários de qualquer um                │  
│  ✓ Deletar comentários alheios                   │  
│                                                    │  
│ EDITOR (Membro da equipe com permissão)          │  
│  ✓ Ver tarefas do workspace                      │  
│  ✓ Criar tarefas no workspace                    │  
│  ✓ Editar tarefas que criou OU está atribuído   │  
│  ✓ Editar tarefas onde é participante (limitado)│  
│  ✓ Mover etapa se responsável                    │  
│  ✓ Adicionar participantes                       │  
│  ✗ Deletar tarefas de outros                    │  
│  ✓ Comentar em qualquer tarefa                  │  
│  ✓ Deletar apenas seus comentários               │  
│                                                    │  
│ VISUALIZADOR (Viewer / Read-only)                │  
│  ✓ Ver tarefas do workspace                      │  
│  ✗ Criar tarefas                                │  
│  ✗ Editar tarefas                               │  
│  ✓ Comentar (em alguns casos)                   │  
│  ✗ Mover etapa                                  │  
│  ✗ Deletar                                      │  
│                                                    │  
└────────────────────────────────────────────────────┘

PERMISSÕES POR CAMPO:

CAMPO          │ ADMIN  │ EDITOR  │ VIEWER  
───────────────┼────────┼─────────┼─────  
Título         │  ✏️    │  ✏️     │  👁️  
Descrição      │  ✏️    │  ✏️     │  👁️  
Tipo           │  📍    │  📍     │  📍  
Prioridade     │  ✏️    │  ✏️     │  👁️  
Estimativa     │  ✏️    │  ✏️     │  👁️  
Responsável    │  ✏️    │  ✏️     │  👁️  
Participantes  │  ✏️    │  ✏️     │  👁️  
Etapa          │  ✏️    │  ✏️     │  👁️  
Deadline       │  ✏️    │  ✏️     │  👁️  
Tags           │  ✏️    │  ✏️     │  👁️  
Comentar       │  ✏️    │  ✏️     │  ✏️  
Deletar        │  🗑️    │  🗑️     │  ✗

📍 \= Não pode mudar depois (apenas editar antes de criar)  
✏️ \= Pode editar  
👁️ \= Pode visualizar  
🗑️ \= Pode deletar  
✗ \= Sem acesso

### **Privacidade e Visibilidade**

QUEM VÊ QUAL TAREFA:

Tarefa no Workspace A:  
  └─ ADMIN: vê (admin vê tudo)  
  └─ EDITOR do Workspace A: vê  
  └─ EDITOR do Workspace B: NÃO vê  
  └─ VIEWER do Workspace A: vê  
  └─ Responsável (em outro workspace): pode ver se tem permissão workspace

TAREFAS PRIVADAS (opcional):  
  └─ Pode marcar tarefa como "Privada"  
  └─ Apenas responsável, participantes, admin veem  
  └─ Não aparece em listas públicas

TAREFAS DE PROJETO:  
  └─ Visibilidade definida pelo projeto  
  └─ Se projeto é privado, tarefas também são  
  └─ Se projeto é público, tarefas visíveis  
---

## **10\. CHECKLISTS EM TAREFAS**

### **Estrutura e Funcionalidade**

CHECKLIST \= Lista de sub-itens/tasks dentro de uma tarefa

CRIAR CHECKLIST:

1\. Na tarefa, seção "Checklist"  
2\. \[+ Adicionar item\]  
3\. Campo aparece: \[☐ Digite aqui\]  
4\. Digita: "Implement authentication"  
5\. Pressiona Enter → item criado  
6\. \[+ Adicionar item\] novamente para próximo

ESTRUTURA:  
┌──────────────────────────────────────────┐  
│ 📋 CHECKLIST (3 de 7 completos \- 43%)    │  
├──────────────────────────────────────────┤  
│ ☑ Implement TOTP logic                   │  
│   └─ Completado por João em 11/08      │  
│                                          │  
│ ☑ Create QR code generator               │  
│   └─ Completado por João em 11/08      │  
│                                          │  
│ ☐ Add email backup codes                 │  
│   └─ Atribuído a João                    │  
│                                          │  
│ ☐ Write unit tests                       │  
│   └─ Atribuído a Maria                   │  
│                                          │  
│ ☐ Write integration tests                │  
│   └─ Atribuído a Maria                   │  
│                                          │  
│ ☐ Update API documentation               │  
│   └─ Atribuído a Pedro                   │  
│                                          │  
│ ☐ Deploy to staging                      │  
│   └─ Sem atribuição                      │  
│                                          │  
│ \[+ Adicionar novo item\]                  │  
└──────────────────────────────────────────┘

MARCAR COMO COMPLETO:  
  1\. Clica no checkbox ☐ → ☑  
  2\. Sistema registra:  
     ├─ Quem marcou  
     ├─ Quando marcou  
     └─ Tempo total para completar (se houver)  
  3\. Barra de progresso atualiza  
  4\. Se todos checklist \= ✓ → notificação especial

AÇÕES EM CHECKLIST ITEM:  
  ├─ Editar: clica item → edit → save  
  ├─ Deletar: hover → \[×\]  
  ├─ Rearranjar: drag & drop  
  ├─ Atribuir: clicar item → assign person  
  └─ Reabrir: desmarcar checkbox

IMPACTO NO PROGRESSO:  
  ├─ Tarefa com checklist mostra % visual  
  ├─ Progresso geral \= soma de todos checklists  
  ├─ Ex: 5 itens completados de 10 \= 50%  
  ├─ Barra fica verde conforme % aumenta  
  └─ Notificação ao atingir 100%  
---

## **11\. ANEXOS E COMPARTILHAMENTO DE ARQUIVOS**

### **Upload e Gerenciamento**

FAZER UPLOAD:

1\. Seção "Anexos" na tarefa  
2\. \[+ Upload arquivo\] ou Drag & drop  
3\. Seleciona arquivo (local)  
4\. Arquivo começa upload:  
   └─ "Carregando 25% ⏳"  
   └─ "Carregando 50% ⏳"  
   └─ "Carregando 100% ✓"  
5\. Arquivo aparece na lista

INFORMAÇÕES DO ARQUIVO:  
┌──────────────────────────────────────────┐  
│ 📄 requirements.txt (15 KB)               │  
│ Upload por: Maria Silva                  │  
│ Em: 11/08/2026 às 10:45                 │  
│ \[Download\] \[Visualizar\] \[Compartilhar\] \[✕\]│  
└──────────────────────────────────────────┘

TIPOS SUPORTADOS:  
  ├─ Documentos: .pdf, .doc, .docx, .xls, .xlsx, .ppt  
  ├─ Imagens: .png, .jpg, .jpeg, .gif  
  ├─ Código: .py, .js, .java, .cpp, .txt  
  ├─ Compactados: .zip, .tar, .gz  
  ├─ Vídeos: .mp4, .avi, .mov  
  └─ Áudio: .mp3, .wav

LIMITE DE UPLOAD:  
  ├─ Por arquivo: 100 MB (configurável)  
  ├─ Total por tarefa: 500 MB (configurável)  
  ├─ Máximo de arquivos: 20 por tarefa

AÇÕES:  
  ├─ Download: clica \[Download\] → salva localmente  
  ├─ Visualizar: clica \[Visualizar\] → abre preview  
  │  └─ PDFs, imagens, videos têm preview built-in  
  │  └─ Outros podem ser visualizados com viewer online  
  ├─ Compartilhar: clica \[Compartilhar\]  
  │  └─ Gera link público (opcional expiração)  
  │  └─ Pode copiar ou compartilhar via email  
  └─ Deletar: clica \[✕\] → confirma → remove

VERSIONING (se ativado):  
  └─ Se upload novo arquivo com mesmo nome:  
     ├─ Opção 1: Sobrescrever versão  
     ├─ Opção 2: Manter como nova versão  
     └─ Versões anteriores acessíveis no histórico  
---

## **12\. RELACIONAMENTOS E DEPENDÊNCIAS**

### **Tipos de Relacionamento**

RELACIONAR TAREFAS:

Ao editar: \[+ Adicionar relacionamento\]

TIPOS:

1️⃣ BLOQUEANTE  
   └─ Esta tarefa BLOQUEIA outra  
   └─ Ex: Tarefa A (2FA login) bloqueia Tarefa B (2FA em app)  
   └─ Lógica: B não pode ser concluída até A terminar  
   └─ Símbolo: ➜ ou 🚫

2️⃣ BLOQUEADA POR  
   └─ Esta tarefa ESPERA por outra  
   └─ Ex: Tarefa B bloqueada por Tarefa A  
   └─ Lógica: não pode mover para fase final até A terminar  
   └─ Símbolo: ⬅ ou ⏳

3️⃣ RELACIONADA COM  
   └─ Apenas informação / contexto  
   └─ Ex: Tarefa de 2FA relacionada com Tarefa de security  
   └─ Lógica: nenhuma dependência, só referência  
   └─ Símbolo: 🔗

ESTRUTURA DE VISUALIZAÇÃO:

Tarefa A: Implementar 2FA  
├─ Bloqueia ➜ Tarefa B  
├─ Bloqueia ➜ Tarefa C  
└─ Bloqueada por ⬅ Tarefa Z

Tarefa B: Deploy 2FA  
└─ Bloqueada por ⬅ Tarefa A

IMPACTOS:

Bloqueantes:  
  ├─ Sistema impede conclusão de B enquanto A não terminar  
  ├─ Mostra aviso: "Esta tarefa está bloqueando 2 outras"  
  ├─ Mostra aviso em B: "Aguardando Tarefa A"  
  ├─ Kanban pode mostrar visualmente (corrente)  
  └─ Relatório mostra dependency chain

Relacionadas:  
  └─ Apenas aparecem juntas em relatórios/filtros  
  └─ Sem impacto em conclusão

GANTT VIEW:  
  └─ Mostra visualmente:  
     ├─ Setas conectando tarefas bloqueantes  
     ├─ Se A termina 15/08 e B começa 16/08, visível  
     └─ Identifica gargalos  
---

## **13\. CASOS DE USO E WORKFLOWS AVANÇADOS**

### **Caso 1: Tarefa com Sub-tarefas (Checklist Detalhado)**

Tarefa Principal: "Implementar autenticação 2FA"  
  ├─ Subtarefa 1: Implement TOTP  
  │  └─ Responsável: João  
  │  └─ Estimativa: 4h  
  │  └─ Prazo: 12/08  
  │  └─ Checklist:  
  │     ├─ ☑ Pesquisar bibliotecas TOTP  
  │     ├─ ☑ Escolher bcryptjs  
  │     ├─ ☐ Implementar geração  
  │     └─ ☐ Testar  
  │  
  ├─ Subtarefa 2: QR Code Setup  
  │  └─ Responsável: Maria  
  │  └─ Estimativa: 3h  
  │  └─ Depende de: Subtarefa 1  
  │  
  └─ Subtarefa 3: Testing  
     └─ Responsável: Pedro  
     └─ Estimativa: 5h  
     └─ Depende de: Subtarefas 1 e 2

FLUXO:  
  1\. Subtarefa 1 começa  
  2\. Subtarefa 1 completa  
  3\. Subtarefa 2 começa (desbloqueada)  
  4\. Subtarefa 3 espera (bloqueada)  
  5\. Subtarefa 2 completa  
  6\. Subtarefa 3 começa (desbloqueada)  
  7\. Subtarefa 3 completa  
  8\. Tarefa Principal \= 100% concluída

### **Caso 2: Tarefa com Aprovação Multi-Etapa**

Fluxo: Solicitação → Análise → Aprovação → Implementação → Deploy

Tarefa: "Novo recurso de dashboard"

Etapa 1: Backlog (solicitação)  
  └─ Criador: gerente  
  └─ Descreve recurso  
  └─ Envia para análise

Etapa 2: Em Análise  
  └─ Responsável: analista  
  └─ Estima esforço  
  └─ Adiciona documentação  
  └─ Comenta sobre viabilidade  
  └─ Move para Aprovação

Etapa 3: Aprovação  
  └─ Responsável: product owner  
  └─ Revisar análise  
  └─ Comentário: "Aprovado para Q4"  
  └─ Move para Implementação  
  └─ (Se não aprovada → volta para Análise)

Etapa 4: Implementação  
  └─ Responsável: dev  
  └─ Implementa recurso  
  └─ Adiciona testes  
  └─ Move para Deploy

Etapa 5: Deploy  
  └─ Responsável: DevOps  
  └─ Deploy em produção  
  └─ Move para Concluído  
  └─ Data de conclusão registrada

SISTEMA REGISTRA:  
  └─ Tempo em cada etapa  
  └─ Quem aprovou  
  └─ Comentários em cada etapa  
  └─ Histórico completo

### **Caso 3: Tarefa Urgente (Escalação)**

Contexto: Bug crítico encontrado em produção

ANTES (status normal):  
  └─ Tarefa em "Backlog"  
  └─ Prioridade: Normal  
  └─ Estimativa: 8h  
  └─ Deadline: próxima semana

EVENTO: Bug crítico descoberto\!

AÇÕES IMEDIATAS:  
  1\. Editar prioridade: Normal → 🔴 CRÍTICA  
  2\. Editar deadline: próxima semana → HOJE  
  3\. Reatribuir: Dev A → Dev B (mais experiente)  
  4\. Comentário: "@DevB Bug crítico em produção \- 1000 usuários afetados"  
  5\. Notificações enviadas automaticamente  
  6\. Tarefa marca com 🔴 em todas as visualizações

RESULTADO:  
  └─ DevB recebe notif urgente  
  └─ Vê na lista com destaque vermelho  
  └─ Kanban mostra em topo (prioridade)  
  └─ Começa a trabalhar imediatamente

RESOLUÇÃO:  
  └─ Completa em 1h  
  └─ Move para Concluído  
  └─ Sistema registra: "Resolvido em 1 hora (SLA: 8h)"  
  └─ Notificação final enviada

### **Caso 4: Tarefa Recorrente (Sprint Planning)**

TAREFA: "Sprint Planning Weekly"

CONFIGURAÇÃO:  
  └─ Recorrência: Semanal (toda segunda-feira)  
  └─ Horário: 10:00 AM  
  └─ Duração: 1 hora  
  └─ Responsável: Scrum Master  
  └─ Participantes: Todos devs  
  └─ Prioridade: Alta

CADA SEMANA:  
  └─ Segunda 10h: nova tarefa criada automaticamente  
  └─ "Sprint Planning \- Semana 31"  
  └─ Mesmos responsáveis/participantes  
  └─ Mesma prioridade  
  └─ Estimativa: 1 hora  
  └─ Deadline: mesma segunda-feira às 11h

HISTÓRICO:  
  └─ "Sprint Planning \- Semana 31" ✓ Concluído  
  └─ "Sprint Planning \- Semana 32" 🟡 Em Progresso  
  └─ "Sprint Planning \- Semana 33" 🔵 Próxima

BENEFÍCIO:  
  └─ Não precisa recriar manualmente  
  └─ Sempre aparece com mesma config  
  └─ Histórico de todas as sprints  
---

## **14\. INTEGRAÇÃO COM OUTROS MÓDULOS**

TAREFAS se integra com:

├─ FLUXO DE TRABALHO  
│  └─ Tarefa segue as fases do fluxo  
│  └─ SLA da etapa afeta tarefa  
│  └─ Transição automática em algumas configs  
│  
├─ TIPOS DE TAREFA  
│  └─ Cada tarefa tem um tipo  
│  └─ Tipo define ícone/cor  
Perguntar antes de agir  
[Claude é uma IA e pode cometer erros. Verifique as respostas.](https://support.anthropic.com/en/articles/8525154-claude-is-providing-incorrect-or-misleading-responses-what-s-going-on)  
