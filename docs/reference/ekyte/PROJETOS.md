\# 📊 \*\*ANÁLISE PROFUNDA: MÓDULO "PROJETOS" (Projects)\*\*

\#\# \*\*1. O QUE É "PROJETOS"\*\*

\*\*Projetos (Projects)\*\* é um \*\*agrupador de tarefas\*\* que permite organizar e gerenciar múltiplas tarefas relacionadas como uma unidade coesa.

\*\*Analogia:\*\*  
\`\`\`  
Se TAREFAS são "atividades individuais",  
então PROJETOS são "iniciativas/programas que agrupam múltiplas atividades".

Exemplo:  
Tarefa 1: "Implementar login com 2FA"  
Tarefa 2: "Implementar autenticação por SSO"  
Tarefa 3: "Adicionar MFA via SMS"  
        ↓  
Projeto: "Upgrade de Segurança 2024"  
        ↑  
Todas as 3 tarefas pertencem a este projeto  
\`\`\`

\*\*Importância:\*\*  
\- 📊 \*\*Visualização estratégica\*\* \- ver o quadro geral  
\- 📈 \*\*Métricas agregadas\*\* \- progresso, esforço, timeline  
\- 👥 \*\*Colaboração em escala\*\* \- equipes trabalhando juntas  
\- ⏰ \*\*Planejamento\*\* \- datas de início/fim do projeto  
\- 💰 \*\*Estimativa\*\* \- esforço total, recursos necessários  
\- 🎯 \*\*Alinhamento\*\* \- todos na mesma página

\---

\#\# \*\*2. ESTRUTURA DA PÁGINA \- VISTA PROJETOS\*\*

\`\`\`  
┌──────────────────────────────────────────────────────┐  
│ CONTROLE DE PROJETOS                                 │  
├──────────────────────────────────────────────────────┤  
│                                                      │  
│ 🎯 FILTROS RÁPIDOS (inline):                        │  
│  ├─ Workspace: \[Todas ▼\]                            │  
│  ├─ Responsável: \[Todos ▼\]                          │  
│  ├─ Squad: \[Todos ▼\]                                │  
│  ├─ Tags: \[Todas ▼\]                                 │  
│  ├─ Progresso: \[Todos ▼\]                            │  
│  ├─ Tendência esforço: \[Todos ▼\]                    │  
│  ├─ Planejado: \[Todos ▼\]                            │  
│  ├─ Situação: \[Ativos ▼\]                            │  
│  └─ Período: \[Todo o período ▼\]                     │  
│                                                      │  
│ 📑 ABAS:                                            │  
│  \[PROJETOS\] \[MODELOS\]                              │  
│  └─ Projetos: Projetos reais em execução           │  
│  └─ Modelos: Templates/modelos de projetos         │  
│                                                      │  
│ 🎮 CONTROLES:                                       │  
│  ├─ Agrupar por: \[selector\]                        │  
│  ├─ Buscar projetos: \[search\_box\]                  │  
│  ├─ \[Mostrar/ocultar colunas\]                      │  
│  └─ \[Exportar Excel\]                               │  
│                                                      │  
│ 📊 TABELA:                                          │  
│ ┌─┬────┬────────┬────────┬──────┬──────────────┐  │  
│ │☐│Id  │Projeto │Progress│Tarefs│Responsável  │  │  
│ ├─┼────┼────────┼────────┼──────┼──────────────┤  │  
│ │ │    │        │        │      │              │  │  
│ │ │ Nenhum resultado encontrado                │  │  
│ │ │    │        │        │      │              │  │  
│ └─┴────┴────────┴────────┴──────┴──────────────┘  │  
│                                                      │  
│ \[+ Adicionar projeto\]                              │  
│                                                      │  
└──────────────────────────────────────────────────────┘  
\`\`\`

\*\*Colunas da Tabela:\*\*

| Coluna | Tipo | Função |  
|--------|------|--------|  
| \*\*Checkbox\*\* | Input | Selecionar múltiplos projetos |  
| \*\*Id\*\* | Text | ID único do projeto |  
| \*\*Identificação\*\* | Badge | Sigla/código do projeto |  
| \*\*Projeto\*\* | Link | Nome do projeto (clicável para abrir detalhe) |  
| \*\*Workspace\*\* | Text | Qual workspace pertence |  
| \*\*Evolução tarefas\*\* | Graph | Gráfico de progresso das tarefas |  
| \*\*Tendência esforço\*\* | Trend | Seta indicando se esforço cresce/cai |  
| \*\*Tarefas\*\* | Number | Quantidade total de tarefas |  
| \*\*Tarefas atrasadas\*\* | Number | Tarefas com deadline vencido |  
| \*\*Início\*\* | Date | Data de início do projeto |  
| \*\*Responsável\*\* | Avatar | Quem gerencia o projeto |  
| \*\*Planejado\*\* | Date | Data de conclusão planejada |  
| \*\*Situação\*\* | Badge | Status (Ativo, Concluído, Cancelado) |

\---

\#\# \*\*3. HIERARQUIA E RELACIONAMENTOS\*\*

\`\`\`  
┌────────────────────────────────────────────────────────┐  
│                        EMPRESA                         │  
│                    (Kev Seguros)                       │  
└────────────┬─────────────────────────────┬─────────────┘  
             │                             │  
        ┌────▼────┐                   ┌────▼────┐  
        │WORKSPACE │                   │WORKSPACE│  
        │ Padrão  │                   │ Suporte │  
        └────┬────┘                   └────┬────┘  
             │                             │  
        ┌────▼──────────────┐          ┌───▼────┐  
        │ PROJETOS          │          │PROJETOS │  
        │ (Workspace 1\)     │          │(WS 2\)   │  
        └────┬──────────────┘          └───┬────┘  
             │                             │  
    ┌────────┼────────────┬────────┐       │  
    │        │            │        │       │  
┌───▼──┐ ┌──▼────┐ ┌──────▼──┐ ┌──▼──┐  ┌─▼────┐  
│Proj1 │ │Proj 2 │ │ Proj 3  │ │Proj4│  │Proj5 │  
│ 2FA  │ │ SSO   │ │ Billing │ │API  │  │CRM   │  
└───┬──┘ └──┬────┘ └──────┬──┘ └──┬──┘  └─┬────┘  
    │       │             │       │       │  
    │   ┌───┴─────────────┴───┬───┴───┐   │  
    │   │      TAREFAS        │       │   │  
    │   └─────────────────────┘       │   │  
    │                                 │   │  
    │                                 │   │  
┌───▼───────┬──────┬──────┬──────┬──────┐ │  
│ Task 1.1  │Task 1.2│Task 2.1│Task 2.2│...│ └─ No projeto  
│(2FA)      │(2FA)  │(SSO) │(SSO) │        │  
└───────────┴──────┴──────┴──────┴──────┘

CADA PROJETO TEM:  
├─ Nome  
├─ Descrição  
├─ Datas (início, conclusão planejada)  
├─ Responsável (gerente do projeto)  
├─ Equipe associada  
├─ Status (Ativo/Concluído/Cancelado)  
├─ Identificação/Sigla (ex: "2FA")  
├─ Workspace  
├─ Tags  
└─ Múltiplas tarefas associadas  
\`\`\`

\---

\#\# \*\*4. FLUXO COMPLETO DE VIDA DE UM PROJETO\*\*

\#\#\# \*\*FASE 1: CRIAÇÃO\*\*

\`\`\`  
┌──────────────────────────────────────────────────┐  
│ PASSO 1: User clica "+ Adicionar projeto"       │  
│  ou usa atalho no menu flutuante                │  
└────────┬─────────────────────────────────────────┘  
         │  
┌────────▼──────────────────────────────────────────┐  
│ PASSO 2: FORM ABRE (modal ou sidebar)            │  
│                                                  │  
│ SEÇÃO 1: IDENTIFICAÇÃO                          │  
│  ├─ Nome do projeto: \[\_\_\_\_\_\_\_\_\_\_\_\_\_\]            │  
│  ├─ Sigla/Código: \[\_\_\_\]                         │  
│  ├─ Descrição: \[\_\_\_\_\_\_\_\_\_\_\_\_\_\]                  │  
│  └─ Ícone: \[selector\] (opcional)                │  
│                                                  │  
│ SEÇÃO 2: RESPONSABILIDADE                       │  
│  ├─ Responsável: \[Person ▼\]                    │  
│  ├─ Equipe: \[+ Adicionar pessoas\]               │  
│  └─ Squad: \[Squad ▼\] (opcional)                │  
│                                                  │  
│ SEÇÃO 3: TIMELINE                               │  
│  ├─ Data de início: \[\_\_\_/\_\_\_/\_\_\_\]               │  
│  ├─ Data de conclusão planejada: \[\_\_\_/\_\_\_/\_\_\_\]  │  
│  └─ Duração estimada: \[\_\_\] semanas/meses        │  
│                                                  │  
│ SEÇÃO 4: CONFIGURAÇÃO                           │  
│  ├─ Workspace: \[Padrão ▼\]                       │  
│  ├─ Privado: \[☐ Sim\]  \[☑ Não\]                 │  
│  ├─ Público: \[☐ Sim\]  \[☑ Não\]                 │  
│  ├─ Arquivo de modelo: \[☐ Usar template\]       │  
│  └─ Tags: \[+ Adicionar tags\]                    │  
│                                                  │  
│ SEÇÃO 5: OPÇÕES                                 │  
│  ├─ Status inicial: \[Planejado ▼\]               │  
│  ├─ Orçamento: \[\_\_\_\_\_\_\_\_\_\_\] (opcional)          │  
│  └─ Esforço estimado: \[\_\_\] horas                │  
│                                                  │  
│ \[Salvar\] ou \[Salvar e abrir\] \[Cancelar\]        │  
└────────┬──────────────────────────────────────────┘  
         │  
┌────────▼──────────────────────────────────────────┐  
│ PASSO 3: Preenche campos obrigatórios            │  
│  ✓ Nome (obrigatório)                            │  
│  ✓ Responsável (obrigatório)                     │  
│  ✓ Data de início (obrigatório)                  │  
│  ✓ Data de conclusão (obrigatório)               │  
│  ○ Descrição (opcional)                          │  
│  ○ Equipe (opcional)                             │  
│  ○ Tags (opcional)                               │  
└────────┬──────────────────────────────────────────┘  
         │  
┌────────▼──────────────────────────────────────────┐  
│ PASSO 4: Clica "Salvar"                          │  
│  ├─ Valida campos obrigatórios                   │  
│  ├─ Insere no banco de dados                     │  
│  ├─ Gera ID único                                │  
│  ├─ Cria associação com workspace                │  
│  ├─ Registra criador \+ data/hora                 │  
│  ├─ Envia notificação ao responsável             │  
│  └─ Abre modal sucesso ou vai para detalhe       │  
└────────┬──────────────────────────────────────────┘  
         │  
┌────────▼──────────────────────────────────────────┐  
│ PASSO 5: PROJETO CRIADO ✓                        │  
│  ├─ Status: PLANEJADO (ou ativo)                 │  
│  ├─ Responsável: \[pessoa atribuída\]              │  
│  ├─ Nenhuma tarefa associada ainda               │  
│  └─ Visível na lista                             │  
└──────────────────────────────────────────────────┘  
\`\`\`

\---

\#\# \*\*5. CAMPOS DO FORMULÁRIO (Detalhado)\*\*

\#\#\# \*\*SEÇÃO 1: IDENTIFICAÇÃO\*\*

\#\#\#\# \*\*Campo: Nome do Projeto\*\*  
\`\`\`  
Label: "Nome do Projeto"  
Type: Text Input  
Placeholder: "ex: Upgrade de Segurança 2024, App Mobile v2"  
Validation:  
  \- Required (obrigatório)  
  \- Min: 5 caracteres  
  \- Max: 150 caracteres  
Help Text: "Nome único que descreve o projeto"  
Impacto: Aparece em:  
  \- Título do projeto em toda parte  
  \- Notificações  
  \- Relatórios  
  \- Listas  
\`\`\`

\#\#\#\# \*\*Campo: Sigla/Código\*\*  
\`\`\`  
Label: "Sigla" ou "Identificação"  
Type: Text Input  
Placeholder: "ex: SEC-2024, MOB-V2, API"  
Validation:  
  \- Optional (não obrigatório)  
  \- Max: 10 caracteres  
  \- Alphanumeric \+ hífens  
Help Text: "Código curto para identificação rápida"  
Impacto:  
  \- Aparece junto ao nome em listas  
  \- Usado em relatórios  
  \- Identificação visual  
  \- Ex: "SEC-2024: Upgrade de Segurança"  
\`\`\`

\#\#\#\# \*\*Campo: Descrição\*\*  
\`\`\`  
Label: "Descrição"  
Type: Rich Text Editor  
Placeholder: "ex: Detalhe do projeto..."  
Validation:  
  \- Optional (não obrigatório)  
  \- Max: 5.000 caracteres  
Help Text: "Contexto, objetivos, escopo do projeto"  
Recursos:  
  \- Formatação: Bold, Itálico, Listas  
  \- @mention para mencionar pessoas  
  \- Links  
\`\`\`

\#\#\#\# \*\*Campo: Ícone\*\*  
\`\`\`  
Label: "Ícone"  
Type: Icon Picker  
Options: Ícones predefinidos (opcional)  
Default: Nenhum ou padrão  
Help Text: "Selecione um ícone para visualizar"  
Impacto: Mostra ao lado do nome em alguns layouts  
\`\`\`

\---

\#\#\# \*\*SEÇÃO 2: RESPONSABILIDADE\*\*

\#\#\#\# \*\*Campo: Responsável (Project Manager)\*\*  
\`\`\`  
Label: "Responsável" ou "Gerente do Projeto"  
Type: User Select / Autocomplete  
Options: Usuários ativos da empresa  
Default: Usuário logado (atual)  
Validation: Required (obrigatório)  
Help Text: "Quem gerencia este projeto?"  
Restrições:  
  \- Só pode ser 1 responsável  
  \- Deve ser usuário ativo  
Impacto:  
  \- Recebe notificações do projeto  
  \- Aparece em listas  
  \- Responsável por métricas  
  \- Pode editar projeto  
\`\`\`

\#\#\#\# \*\*Campo: Equipe\*\*  
\`\`\`  
Label: "Equipe" ou "Membros"  
Type: Multi-select / Autocomplete  
Options: Todos os usuários ativos  
Default: Nenhum (opcional)  
Validation: Optional, pode ter múltiplos  
Help Text: "Quem trabalha neste projeto?"  
Diferença do Responsável:  
  \- Responsável \= gerente  
  \- Membros \= quem executa  
Impacto:  
  \- Recebem notificações  
  \- Aparecem em relatórios  
  \- Alocação de recursos  
\`\`\`

\#\#\#\# \*\*Campo: Squad\*\*  
\`\`\`  
Label: "Squad"  
Type: Dropdown/Select  
Options: Squads criados  
Default: Nenhum (opcional)  
Validation: Optional  
Help Text: "Qual squad dedicada trabalha nisso?"  
Impacto:  
  \- Agrupar projetos por squad  
  \- Visualização de squad  
  \- Métricas por squad  
\`\`\`

\---

\#\#\# \*\*SEÇÃO 3: TIMELINE\*\*

\#\#\#\# \*\*Campo: Data de Início\*\*  
\`\`\`  
Label: "Data de Início" ou "Início Planejado"  
Type: Date Picker  
Default: Hoje  
Validation: Required, data válida  
Help Text: "Quando o projeto começa?"  
Regras:  
  \- Pode ser no passado (projeto já começou)  
  \- Pode ser no futuro (planejamento futuro)  
Impacto:  
  \- Visível em relatórios  
  \- Cálculo de tempo decorrido  
  \- Gantt chart  
\`\`\`

\#\#\#\# \*\*Campo: Data de Conclusão Planejada\*\*  
\`\`\`  
Label: "Data de Conclusão Planejada", "Deadline", "Fim Planejado"  
Type: Date Picker  
Default: Vazio ou \+30 dias de hoje  
Validation: Required, deve ser \>= Data Início  
Help Text: "Quando o projeto deve estar pronto?"  
Planejado vs Real:  
  \- Planejado \= quando DEVERIA terminar  
  \- Real \= quando EFETIVAMENTE terminou  
Impacto:  
  \- Alerta se ultrapassar  
  \- Gantt mostra barra de tempo  
  \- Filtro "Projetos Atrasados"  
\`\`\`

\#\#\#\# \*\*Campo: Duração Estimada\*\*  
\`\`\`  
Label: "Duração Estimada"  
Type: Number \+ Unit Dropdown  
Units: Dias, Semanas, Meses  
Default: Auto-calcula das datas  
Validation: Optional  
Help Text: "Quanto tempo o projeto vai levar?"  
Relação com datas:  
  \- Se preenchido: ajusta data final automaticamente  
  \- Se data preenchida: calcula duração  
\`\`\`

\---

\#\#\# \*\*SEÇÃO 4: CONFIGURAÇÃO\*\*

\#\#\#\# \*\*Campo: Workspace\*\*  
\`\`\`  
Label: "Workspace"  
Type: Dropdown/Select  
Options: Todos os workspaces do usuário  
Default: Workspace padrão  
Validation: Required  
Help Text: "Em qual workspace este projeto opera?"  
Impacto:  
  \- Define isolamento de dados  
  \- Filtra visibilidade  
  \- Controla acesso  
\`\`\`

\#\#\#\# \*\*Campo: Privacidade\*\*  
\`\`\`  
Label: "Privado"  
Type: Toggle / Radio  
Options:  
  \- ☑ Privado (apenas responsável, membros, admin veem)  
  \- ☐ Público (todos no workspace veem)  
Default: Público  
Validation: Optional  
Help Text: "Quem pode ver este projeto?"  
Impacto:  
  \- Visibilidade em listas  
  \- Quem pode adicionar tarefas  
  \- Quem pode comentar  
\`\`\`

\#\#\#\# \*\*Campo: Usar Modelo\*\*  
\`\`\`  
Label: "Baseado em modelo"  
Type: Dropdown / Checkbox  
Options: Modelos de projeto existentes  
Default: Nenhum (do zero)  
Validation: Optional  
Help Text: "Copiar estrutura de um modelo?"  
Resultado:  
  \- Se selecionado: copia campos do modelo  
  \- Se não: projeto vazio  
  \- Modelos podem ter tarefas template  
\`\`\`

\#\#\#\# \*\*Campo: Tags\*\*  
\`\`\`  
Label: "Tags"  
Type: Multi-select / Autocomplete  
Options: Tags existentes (ou criar nova)  
Default: Nenhuma (opcional)  
Validation: Optional, Max 10 tags  
Help Text: "Classifique o projeto"  
Exemplos: "2024", "Importante", "Cliente"  
Impacto:  
  \- Filtragem  
  \- Agrupamento  
  \- Busca  
\`\`\`

\---

\#\#\# \*\*SEÇÃO 5: ORÇAMENTO E ESFORÇO\*\*

\#\#\#\# \*\*Campo: Orçamento\*\*  
\`\`\`  
Label: "Orçamento"  
Type: Currency Input  
Default: Vazio (opcional)  
Validation: Optional, número \>= 0  
Help Text: "Orçamento total do projeto"  
Formato: 10.000,00 (ou formato local)  
Impacto:  
  \- Relatório de custos  
  \- Comparar gasto vs orçamento  
  \- Alertas se ultrapassar  
\`\`\`

\#\#\#\# \*\*Campo: Esforço Estimado\*\*  
\`\`\`  
Label: "Esforço Estimado"  
Type: Number Input  
Unit: Horas ou Dias  
Default: 0 ou vazio  
Validation: Optional, \>= 0  
Help Text: "Quantas horas/dias o projeto vai levar?"  
Impacto:  
  \- Alocação de recursos  
  \- Capacidade de equipe  
  \- Comparar estimado vs real  
\`\`\`

\---

\#\# \*\*6. ASSOCIAR TAREFAS AO PROJETO\*\*

\#\#\# \*\*Opção 1: Ao Criar Tarefa\*\*

\`\`\`  
Fluxo: Tarefas → \[+ Adicionar tarefa\]  
  └─ No formulário de tarefa:  
     └─ Campo "Projeto": \[Upgrade de Segurança 2024 ▼\]  
     └─ Seleciona projeto  
     └─ Tarefa fica associada ao projeto

Resultado:  
  └─ Tarefa aparece no projeto  
  └─ Projeto mostra mais uma tarefa  
  └─ Progresso do projeto atualiza  
\`\`\`

\#\#\# \*\*Opção 2: Editar Tarefa Existente\*\*

\`\`\`  
Fluxo: Tarefa detail → Editar  
  └─ Campo "Projeto": \[Nenhum ▼\]  
  └─ Seleciona projeto  
  └─ Salva  
  └─ Tarefa agora está no projeto  
\`\`\`

\#\#\# \*\*Opção 3: Drag & Drop (se suportado)\*\*

\`\`\`  
Fluxo: Kanban ou Lista de tarefas  
  └─ Arrasta tarefa  
  └─ Solta no projeto  
  └─ Confirma: "Adicionar ao projeto X?"  
  └─ Tarefa associada  
\`\`\`

\#\#\# \*\*Remover Tarefa do Projeto\*\*

\`\`\`  
Fluxo: Tarefa detail → Editar  
  └─ Campo "Projeto": \[Upgrade de Segurança 2024 ▼\]  
  └─ Clica "Remover"  
  └─ Tarefa sai do projeto  
  └─ Progresso do projeto recalcula  
\`\`\`

\---

\#\# \*\*7. MÉTRICAS E PROGRESSO DO PROJETO\*\*

\#\#\# \*\*Visualizações de Progresso\*\*

\`\`\`  
┌─────────────────────────────────────────────────────┐  
│ PROJETO: Upgrade de Segurança 2024                 │  
├─────────────────────────────────────────────────────┤  
│                                                     │  
│ 📊 PROGRESSO GERAL                                 │  
│  \[████████░░░░░░░░░░\] 55% completo                │  
│  └─ 11 de 20 tarefas concluídas                    │  
│                                                     │  
│ 📋 TAREFAS                                         │  
│  ├─ Total: 20 tarefas                              │  
│  ├─ Concluídas: 11 ✓                               │  
│  ├─ Em Progresso: 7                                │  
│  ├─ Atrasadas: 2 ⚠️                                │  
│  └─ Canceladas: 0                                  │  
│                                                     │  
│ ⏰ TIMELINE                                         │  
│  ├─ Início: 01/01/2024                             │  
│  ├─ Conclusão Planejada: 30/12/2024                │  
│  ├─ Tempo decorrido: 220 dias (60%)               │  
│  ├─ Tempo restante: 145 dias (40%)                │  
│  ├─ Status: ✓ No prazo (até agora)                │  
│  └─ Projeção de conclusão: 25/12/2024 ✓           │  
│                                                     │  
│ 💪 ESFORÇO                                         │  
│  ├─ Estimado: 500 horas                            │  
│  ├─ Gasto até agora: 280 horas (56%)              │  
│  ├─ Restante: 220 horas (44%)                     │  
│  ├─ Taxa: 1,27 horas/dia                           │  
│  └─ Tendência: 📈 Aumentando                       │  
│                                                     │  
│ 👥 EQUIPE                                          │  
│  ├─ Total: 5 pessoas                               │  
│  ├─ Alocadas: João (100%), Maria (80%), Pedro (50%)│  
│  ├─ Carga máxima: Maria (80%)                      │  
│  └─ Média: 63% ocupadas                            │  
│                                                     │  
│ 💰 ORÇAMENTO                                       │  
│  ├─ Total: R$ 50.000,00                            │  
│  ├─ Gasto: R$ 28.000,00 (56%)                      │  
│  ├─ Restante: R$ 22.000,00 (44%)                   │  
│  └─ Status: ✓ Dentro do orçamento                 │  
│                                                     │  
│ ⚠️ ALERTAS                                         │  
│  ├─ 2 tarefas atrasadas                            │  
│  ├─ Esforço acima do esperado                      │  
│  └─ Sugerir: rever estimativas                     │  
│                                                     │  
└─────────────────────────────────────────────────────┘  
\`\`\`

\#\#\# \*\*Gráficos e Visualizações\*\*

\#\#\#\# \*\*Burndown Chart\*\*  
\`\`\`  
Mostra: Trabalho restante vs Tempo

        │ Estimado │ Real  
Horas   │      ◇   │  ◇  
Restantes│         /│ /  
        │        / │/  
        │       /  │ ◇ Tendência real  
        │      /   │/ está acima  
        │     /    │  
        │    ◇─────├────────  
        │          │  Alerta:  
        │          │  Vai atrasar\!  
        │          │  
        └──────────────────  
         Tempo do projeto  
\`\`\`

\#\#\#\# \*\*Evolução de Tarefas\*\*  
\`\`\`  
Mostra: Como tarefas progridem ao longo do tempo

        │ Concluídas  
        │ ────────┐  
        │        /│  
        │       / │ Em Progresso  
        │      /  │ ─────────────  
        │     /   │          ┐  
        │    /    │         /│  
        │   ◇─────┤        / │  
        │  /      │ A fazer/  │  
        │ /       │ ───────   │  
        │/────────┤        ──┘  
        └─────────┴───────────  
        Linha de tempo  
\`\`\`

\#\#\#\# \*\*Tendência de Esforço\*\*  
\`\`\`  
Mostra: Se esforço está aumentando ou diminuindo

Normal: ─────────     (linear)  
Subindo: ╱╱╱╱╱╱╱      (aumenta \- problema\!)  
Caindo:  ╲╲╲╲╲╲╲      (diminui \- bom\!)  
\`\`\`

\---

\#\# \*\*8. RELACIONAMENTO PROJETO ↔ TAREFAS\*\*

\`\`\`  
PROJETO "Upgrade de Segurança 2024"  
├─ Tarefa 1: "Implementar 2FA"  
│  ├─ Status: Em Progresso  
│  ├─ Prioridade: Alta  
│  └─ Deadline: 15/08  
│  
├─ Tarefa 2: "Implementar SSO"  
│  ├─ Status: Backlog  
│  ├─ Prioridade: Média  
│  └─ Deadline: 30/08  
│  
├─ Tarefa 3: "Adicionar MFA via SMS"  
│  ├─ Status: Concluído ✓  
│  ├─ Prioridade: Média  
│  └─ Deadline: 10/08  
│  
├─ Tarefa 4: "Update API docs"  
│  ├─ Status: Concluído ✓  
│  ├─ Prioridade: Baixa  
│  └─ Deadline: 20/08  
│  
└─ Tarefa 5: "Segurança penetration test"  
   ├─ Status: Em Progresso (atrasada ⚠️)  
   ├─ Prioridade: Crítica  
   └─ Deadline: 12/08 (VENCIDA)

PROGRESSO DO PROJETO:  
  ├─ Total de tarefas: 5  
  ├─ Concluídas: 2 (40%)  
  ├─ Em Progresso: 2 (40%)  
  ├─ Backlog: 1 (20%)  
  │  
  ├─ Progresso visual: \[████████░░\] 40%  
  ├─ Tarefas atrasadas: 1  
  └─ Status: ⚠️ ATENÇÃO (tem atraso)  
\`\`\`

\*\*Impactos da Tarefa no Projeto:\*\*

\`\`\`  
QUANDO TAREFA MUDA DE STATUS:  
  ├─ Projeto recalcula progresso automaticamente  
  ├─ Gráficos atualizam em tempo real  
  ├─ Se projeto fica 100% → alerta de conclusão  
  ├─ Notificação ao gerente do projeto  
  └─ Histórico registra mudança

QUANDO TAREFA FICA ATRASADA:  
  ├─ Projeto marca como "com atraso"  
  ├─ Gerente recebe notificação  
  ├─ Projeção de conclusão recalcula  
  └─ Pode indicar que projeto vai atrasar

QUANDO TAREFA ADICIONA ESFORÇO:  
  ├─ Esforço do projeto recalcula  
  ├─ Comparar com orçamento/estimado  
  ├─ Se ultrapassar → alerta  
  └─ Pode sugerir reprioritizar  
\`\`\`

\---

\#\# \*\*9. FILTROS E BUSCAS EM PROJETOS\*\*

\`\`\`  
FILTROS RÁPIDOS (inline):  
  ├─ Workspace: todos / específico  
  ├─ Responsável: pessoa específica  
  ├─ Squad: equipe específica  
  ├─ Tags: etiquetas  
  ├─ Progresso: 0-25% / 25-50% / 50-75% / 75-100%  
  ├─ Tendência esforço: Aumentando / Normal / Diminuindo  
  ├─ Planejado: Atrasados / No prazo / Futuros  
  ├─ Situação: Ativos / Concluídos / Cancelados  
  └─ Período: Data inicial → Data final

BUSCA POR TEXTO:  
  └─ \[🔍 Buscar projetos...\]  
  └─ Busca em: Nome, Sigla, Descrição, Tags  
  └─ Real-time conforme digita

COMBINAÇÃO:  
  └─ Filtros são cumulativos (AND)  
  └─ Ex: Workspace=Dev \+ Responsável=João \+ Progresso=0-25%  
     └─ Mostra projetos no Dev, com João como PM, com 0-25% progress  
\`\`\`

\---

\#\# \*\*10. ESTADOS E CICLO DE VIDA DO PROJETO\*\*

\`\`\`  
CRIAÇÃO  
  │  
  └─► PLANEJADO  
      │ (projeto foi criado, ainda não começou)  
      │  
      ├─► EM EXECUÇÃO / ATIVO  
      │   │ (projeto está em andamento)  
      │   │  
      │   ├─► CONCLUÍDO ✓  
      │   │   │ (todas tarefas finalizadas)  
      │   │   │ └─ Data de conclusão real registrada  
      │   │  
      │   └─► CANCELADO ✗  
      │       │ (projeto foi cancelado)  
      │       │ └─ Motivo pode ser registrado  
      │  
      └─► ARQUIVADO (opcional)  
          │ (projeto guardado, não afeta métricas)  
          │  
          └─► ATIVO/ARQUIVADO pode ser revertido

TRANSIÇÕES:  
  └─ Planejado → Em Execução (manual)  
  └─ Em Execução → Concluído (manual ou automático se 100%)  
  └─ Qualquer → Cancelado (manual)  
  └─ Concluído/Cancelado → Arquivado (manual)  
  └─ Arquivado → Ativo (manual \- desarquivar)  
\`\`\`

\---

\#\# \*\*11. PERMISSÕES EM PROJETOS\*\*

\`\`\`  
┌────────────────────────────────────────────────────┐  
│             PERMISSÕES EM PROJETOS                 │  
├────────────────────────────────────────────────────┤  
│                                                    │  
│ ADMIN (Administrador)                              │  
│  ✓ Ver todos os projetos                          │  
│  ✓ Criar projetos em qualquer workspace           │  
│  ✓ Editar qualquer projeto                        │  
│  ✓ Deletar qualquer projeto                       │  
│  ✓ Arquivar/desarquivar                           │  
│  ✓ Mudar responsável                              │  
│  ✓ Alterar datas                                  │  
│                                                    │  
│ PROJECT MANAGER / RESPONSÁVEL                      │  
│  ✓ Editar seu projeto                             │  
│  ✓ Adicionar/remover tarefas                      │  
│  ✓ Editar membros da equipe                       │  
│  ✓ Mudar status                                   │  
│  ✓ Ver relatórios/métricas                        │  
│  ✗ Deletar projeto (admin only)                  │  
│  ✓ Comentar e colaborar                           │  
│                                                    │  
│ MEMBRO DA EQUIPE                                   │  
│  ✓ Ver projeto (se não privado)                   │  
│  ✓ Ver tarefas associadas                         │  
│  ✓ Editar tarefas do projeto                      │  
│  ✓ Comentar                                       │  
│  ✗ Editar dados do projeto                       │  
│  ✗ Adicionar outras pessoas                       │  
│                                                    │  
│ VISUALIZADOR (Viewer)                              │  
│  ✓ Ver projeto (se público)                       │  
│  ✓ Ver relatórios (read-only)                     │  
│  ✗ Editar                                         │  
│  ✓ Comentar (em alguns casos)                     │  
│                                                    │  
└────────────────────────────────────────────────────┘  
\`\`\`

\---

\#\# \*\*12. MODELOS DE PROJETO (Templates)\*\*

\`\`\`  
MODELOS \= Templates reutilizáveis de projetos

CRIAR MODELO:  
  1\. Cria um projeto "template"  
  2\. Configura campos e tarefas template  
  3\. Marca como "Modelo"  
  4\. Salva

USAR MODELO:  
  1\. \[+ Adicionar projeto\]  
  2\. "Baseado em modelo": \[Selecion modelo ▼\]  
  3\. Copia:  
     ├─ Nome, descrição, tags  
     ├─ Estrutura de tarefas (template)  
     ├─ Equipe base  
     └─ Datas (recalcula)  
  4\. Permite customizar antes de salvar

EXEMPLOS DE MODELOS:  
  ├─ "Projeto de Feature"  
  │  ├─ Tarefa: Design  
  │  ├─ Tarefa: Development  
  │  ├─ Tarefa: Testing  
  │  └─ Tarefa: Deploy  
  │  
  ├─ "Marketing Campaign"  
  │  ├─ Tarefa: Strategy  
  │  ├─ Tarefa: Creative  
  │  ├─ Tarefa: Copywriting  
  │  ├─ Tarefa: Approval  
  │  └─ Tarefa: Publish  
  │  
  └─ "Client Onboarding"  
     ├─ Tarefa: Discovery call  
     ├─ Tarefa: Setup account  
     ├─ Tarefa: Training  
     └─ Tarefa: Go-live  
\`\`\`

\---

\#\# \*\*13. AÇÕES EM PROJETOS\*\*

\`\`\`  
NA LISTA:  
  ├─ Clicar projeto → abre detalhe  
  ├─ \[Editar\] → edita campos  
  ├─ \[Arquivar\] → arquiva projeto  
  ├─ \[Deletar\] → remove projeto  
  ├─ \[Duplicar\] → cria cópia com mesmo config  
  └─ \[Exportar\] → exporta para Excel/PDF

NO DETALHE:  
  ├─ \[Adicionar tarefa\] → nova tarefa neste projeto  
  ├─ \[Editar projeto\] → altera dados  
  ├─ \[Ver gantt\] → visualiza timeline  
  ├─ \[Ver relatório\] → abre relatório detalhado  
  ├─ \[Comentar\] → adiciona comentário  
  └─ \[Histórico\] → vê mudanças  
\`\`\`

\---

\#\# \*\*14. INTEGRAÇÃO COM RESTO DO SISTEMA\*\*

\`\`\`  
PROJETO se integra com:

├─ TAREFAS  
│  └─ Projeto agrupa múltiplas tarefas  
│  └─ Progresso do projeto \= soma do progresso das tarefas  
│  └─ Tarefas do projeto aparecem juntas  
│  
├─ EQUIPES  
│  └─ Associa pessoas ao projeto  
│  └─ Métricas de alocação  
│  
├─ FLUXO DE TRABALHO  
│  └─ Cada tarefa do projeto segue o fluxo  
│  
├─ WORKSPACES  
│  └─ Projeto pertence a um workspace  
│  └─ Visibilidade control  
