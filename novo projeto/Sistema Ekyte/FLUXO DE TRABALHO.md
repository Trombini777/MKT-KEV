Perfeito\! Baseado na exploração que fiz, vou criar uma \*\*análise profunda do módulo "Fluxo de Trabalho"\*\* seguindo exatamente o mesmo padrão de detalhe que fizemos com "Tipos de Tarefa":

\---

\# 🔄 \*\*ANÁLISE PROFUNDA: MÓDULO "FLUXO DE TRABALHO" (Workflow/Phases)\*\*

\#\# \*\*1. O QUE É "FLUXO DE TRABALHO"\*\*

\*\*Fluxo de Trabalho (Workflow)\*\* é a \*\*espinha dorsal\*\* do sistema eKyte. Define o \*\*caminho que uma tarefa percorre\*\* desde sua criação até sua conclusão.

\*\*Analogia Simples:\*\*  
\`\`\`  
Imagine uma fábrica:  
\- Matéria prima entra (Tarefa criada)  
\- Passa por estações (Fases: "A fazer" → "Em progresso" → "Revisão" → "Concluído")  
\- Produto sai pronto (Tarefa completa)

As FASES são as estações. O FLUXO define a sequência.  
\`\`\`

\*\*Importância:\*\*  
\- ⚠️ \*\*OBRIGATÓRIO\*\*: Sem um fluxo ativo, você NÃO pode criar tarefas  
\- 🎯 \*\*Fundamental\*\*: Define como toda a equipe trabalha  
\- 📊 \*\*Rastreamento\*\*: Permite medir progresso das tarefas  
\- 🔍 \*\*Visibilidade\*\*: Mostra em qual etapa cada tarefa está

\---

\#\# \*\*2. ESTRUTURA DA PÁGINA \- "CADASTRO DE FLUXO DE TRABALHO"\*\*

\`\`\`  
┌──────────────────────────────────────────────────┐  
│ FLUXO DE TRABALHO PADRÃO                        │  
├──────────────────────────────────────────────────┤  
│                                                  │  
│ 🎯 FILTROS:                                     │  
│  ├─ Situação: \[Ativos ▼\]     (ícone 🟢)       │  
│  └─ Publicado: \[Todos ▼\]                       │  
│                                                  │  
│ ℹ️ MENSAGEM:                                    │  
│  "Para criação de tarefas é necessário possuir │  
│   um fluxo de trabalho ativo..."               │  
│                                                  │  
│ 📊 TABELA COM COLUNAS:                         │  
│ ┌────┬──────────────┬────────┬────────┬──────┐ │  
│ │ ☐  │ Id           │ Fluxo  │ Criado │ Ativo│ │  
│ ├────┼──────────────┼────────┼────────┼──────┤ │  
│ │    │ nenhum       │ não    │ há     │      │ │  
│ │    │ resultado    │ existe │        │      │ │  
│ └────┴──────────────┴────────┴────────┴──────┘ │  
│                                                  │  
│ \[+ Adicionar fluxo de trabalho\]                │  
│                                                  │  
│ 📑 ABAS:                                        │  
│  \[FLUXOS DE TRABALHO\] \[TIPOS DE TAREFA\]       │  
│  \[EQUIPES E PROFISSIONAIS\]                     │  
│                                                  │  
└──────────────────────────────────────────────────┘  
\`\`\`

\*\*Elementos Detectados:\*\*

| Elemento | Tipo | Função |  
|----------|------|--------|  
| \*\*Situação\*\* | Dropdown | Filtrar por Ativo/Inativo |  
| \*\*Publicado\*\* | Dropdown | Filtrar por Published/Draft |  
| \*\*Tabela\*\* | Data grid | Listar fluxos existentes |  
| \*\*Coluna: Id\*\* | Text | ID único do fluxo |  
| \*\*Coluna: Fluxo\*\* | Text | Nome do fluxo |  
| \*\*Coluna: Criado por\*\* | Text | Quem criou |  
| \*\*Coluna: Criado em\*\* | Date | Data de criação |  
| \*\*Coluna: Alterado em\*\* | Date | Última modificação |  
| \*\*Coluna: Publicado em\*\* | Date | Data publicação |  
| \*\*Coluna: Fluxo padrão\*\* | Boolean | Se é o fluxo padrão (sim/não) |  
| \*\*Coluna: Ativo\*\* | Boolean | Se está ativo |  
| \*\*Buscar\*\* | Input | Pesquisar por nome |  
| \*\*Adicionar\*\* | Button | Criar novo fluxo |

\---

\#\# \*\*3. CONCEITO: FASES vs FLUXO\*\*

\*\*Importante entender a diferença:\*\*

\#\#\# \*\*FASE (Phase)\*\*  
\`\`\`  
Uma ETAPA individual do fluxo.

Exemplos:  
\- "À fazer"  
\- "Em progresso"    
\- "Em revisão"  
\- "Concluído"  
\- "Arquivado"

Cada fase tem:  
├─ Nome (obrigatório)  
├─ Ícone  
├─ Cor  
├─ Ordem (1º, 2º, 3º...)  
├─ SLA/Tempo máximo  
└─ Se é final (fase de conclusão)  
\`\`\`

\#\#\# \*\*FLUXO (Workflow)\*\*  
\`\`\`  
Um CONJUNTO de fases em ordem específica.

Exemplo de fluxo "Desenvolvimento":  
1️⃣ Backlog  
2️⃣ Em Progresso  
3️⃣ Code Review  
4️⃣ Teste  
5️⃣ Deploy  
6️⃣ Concluído

Outro exemplo "Marketing":  
1️⃣ Solicitação  
2️⃣ Planejamento  
3️⃣ Criação  
4️⃣ Aprovação  
5️⃣ Publicação  
6️⃣ Finalizado  
\`\`\`

\---

\#\# \*\*4. FLUXO LÓGICO DO SISTEMA\*\*

\`\`\`  
┌────────────────────────────────────────────────────┐  
│ HIERARQUIA: EMPRESA → FLUXOS → FASES → TAREFAS    │  
└────────────────────────────────────────────────────┘

EMPRESA (Kev Seguros)  
  │  
  ├─ FLUXO 1: "Desenvolvimento" (ATIVO ✓)  
  │   ├─ Fase 1: "Backlog"              (🔵)  
  │   ├─ Fase 2: "Em Progresso"         (🟡)  
  │   ├─ Fase 3: "Code Review"          (🟣)  
  │   ├─ Fase 4: "Concluído"            (🟢 \- FINAL)  
  │   │   └─ TAREFA A: "Fix bug login"  
  │   │   └─ TAREFA B: "Feature X"  
  │   └─ Fase 5: "Cancelled"            (⚫ \- FINAL)  
  │  
  ├─ FLUXO 2: "Marketing" (ATIVO ✓)  
  │   ├─ Fase 1: "Ideação"  
  │   ├─ Fase 2: "Produção"  
  │   ├─ Fase 3: "Revisão"  
  │   └─ Fase 4: "Publicado"            (🟢 \- FINAL)  
  │       └─ TAREFA C: "Campanha X"  
  │  
  └─ FLUXO 3: "Suporte" (INATIVO ✗)  
      ├─ Fase 1: "Aberto"  
      ├─ Fase 2: "Em Análise"  
      ├─ Fase 3: "Resolvido"            (🟢 \- FINAL)  
      └─ Fase 4: "Fechado"              (🟢 \- FINAL)  
\`\`\`

\---

\#\# \*\*5. FLUXO DE USUÁRIO COMPLETO\*\*

\#\#\# \*\*CENÁRIO: Admin criando novo Fluxo de Trabalho\*\*

\`\`\`  
┌─────────────────────────────────────────────────┐  
│ PASSO 1: Acesso à página                        │  
│  Admin navega:                                   │  
│  Menu Lateral \> Configurações \> Fluxo de Work.  │  
└────────┬────────────────────────────────────────┘  
         │  
┌────────▼────────────────────────────────────────┐  
│ PASSO 2: Vê lista de fluxos                     │  
│  ├─ Se tem fluxos: lista com todos             │  
│  │   (Ex: "Desenvolvimento", "Marketing")       │  
│  └─ Se vazio: "Nenhum resultado encontrado"    │  
└────────┬────────────────────────────────────────┘  
         │  
┌────────▼────────────────────────────────────────┐  
│ PASSO 3: Clica "+ Adicionar fluxo"             │  
│  └─ Modal/form abre com campos                 │  
└────────┬────────────────────────────────────────┘  
         │  
┌────────▼────────────────────────────────────────┐  
│ PASSO 4: FORM ABRE com campos básicos           │  
│                                                  │  
│  ┌─────────────────────────────────────────┐   │  
│  │ Nome do Fluxo: \[\_\_\_\_\_\_\_\_\_\_\_\_\_\]          │   │  
│  │ Descrição:     \[\_\_\_\_\_\_\_\_\_\_\_\_\_\]          │   │  
│  │ Fluxo Padrão:  \[☐ Sim\]  \[☑ Não\]       │   │  
│  │ Status:        \[☑ Ativo\] \[☐ Inativo\]  │   │  
│  │                                         │   │  
│  │  \[Próximo →\] ou \[Adicionar Fases\]      │   │  
│  └─────────────────────────────────────────┘   │  
└────────┬────────────────────────────────────────┘  
         │  
┌────────▼────────────────────────────────────────┐  
│ PASSO 5: Admin preenche dados                   │  
│  ├─ Nome: "Desenvolvimento"                    │  
│  ├─ Descrição: "Fluxo para tarefas dev"       │  
│  ├─ Fluxo Padrão: ☑ Não (ou ☐ Sim)           │  
│  └─ Status: ☑ Ativo                           │  
└────────┬────────────────────────────────────────┘  
         │  
┌────────▼────────────────────────────────────────┐  
│ PASSO 6: Clica "Próximo" ou "Adicionar Fases" │  
│  └─ Form expande ou abre modal para fases      │  
└────────┬────────────────────────────────────────┘  
         │  
┌────────▼────────────────────────────────────────┐  
│ PASSO 7: ADICIONAR FASES                        │  
│                                                  │  
│  \[+ Adicionar Fase\]                             │  
│                                                  │  
│  ┌──────────────────────────────────────────┐   │  
│  │ Fase 1                                    │   │  
│  │ ├─ Nome: "Backlog"                       │   │  
│  │ ├─ Ícone: \[🔵\]                          │   │  
│  │ ├─ Cor: \[Azul\]                           │   │  
│  │ ├─ SLA: \[\_\_\_\] dias                       │   │  
│  │ ├─ É fase final? ☐                      │   │  
│  │ └─ \[Deletar fase\]                        │   │  
│  ├─ \[▲\] \[▼\] (reordenar)                     │   │  
│  └──────────────────────────────────────────┘   │  
│                                                  │  
│  ┌──────────────────────────────────────────┐   │  
│  │ Fase 2                                    │   │  
│  │ ├─ Nome: "Em Progresso"                  │   │  
│  │ ├─ Ícone: \[🟡\]                          │   │  
│  │ ├─ Cor: \[Amarelo\]                        │   │  
│  │ ├─ SLA: \[5\] dias                         │   │  
│  │ ├─ É fase final? ☐                      │   │  
│  │ └─ \[Deletar fase\]                        │   │  
│  ├─ \[▲\] \[▼\] (reordenar)                     │   │  
│  └──────────────────────────────────────────┘   │  
│                                                  │  
│  ┌──────────────────────────────────────────┐   │  
│  │ Fase 3                                    │   │  
│  │ ├─ Nome: "Concluído"                     │   │  
│  │ ├─ Ícone: \[🟢\]                          │   │  
│  │ ├─ Cor: \[Verde\]                          │   │  
│  │ ├─ SLA: \[\_\_\_\] (nenhum)                   │   │  
│  │ ├─ É fase final? ☑ SIM                  │   │  
│  │ └─ \[Deletar fase\]                        │   │  
│  ├─ \[▲\] \[▼\] (reordenar)                     │   │  
│  └──────────────────────────────────────────┘   │  
│                                                  │  
│  \[+ Adicionar outra fase\]                       │  
│                                                  │  
│  \[Cancelar\] \[Salvar Fluxo\]                      │  
└────────┬────────────────────────────────────────┘  
         │  
┌────────▼────────────────────────────────────────┐  
│ PASSO 8: Admin clica "Salvar Fluxo"             │  
│  ├─ Sistema valida:                            │  
│  │  ├─ Nome não vazio?                         │  
│  │  ├─ Tem pelo menos 2 fases?                 │  
│  │  ├─ Tem fase final?                         │  
│  │  └─ Nomes únicos nas fases?                 │  
│  │                                              │  
│  ├─ Se OK: Salva no banco                      │  
│  ├─ Se erro: Mostra mensagem de erro           │  
│  └─ Modal fecha / redirecion a lista           │  
└────────┬────────────────────────────────────────┘  
         │  
┌────────▼────────────────────────────────────────┐  
│ PASSO 9: Fluxo criado\!                          │  
│  ├─ Lista é atualizada                         │  
│  ├─ Novo fluxo aparece na tabela               │  
│  ├─ "Desenvolvimento" agora está disponível    │  
│  ├─ Notificação: "Fluxo criado com sucesso\!"  │  
│  └─ Agora é possível criar tarefas neste fluxo│  
└────────┬────────────────────────────────────────┘  
         │  
┌────────▼────────────────────────────────────────┐  
│ PASSO 10: Usar o fluxo                          │  
│  └─ Ao criar TAREFA:                           │  
│     Selecionar Fluxo: \["Desenvolvimento" ▼\]    │  
│     └─ Tarefa vai passar pelas fases           │  
│        Backlog → Em Progresso → Concluído      │  
└────────────────────────────────────────────────┘  
\`\`\`

\---

\#\# \*\*6. CAMPOS DO FORMULÁRIO (Detalhe Técnico)\*\*

\#\#\# \*\*Campo 1: Nome do Fluxo\*\*  
\`\`\`  
Label: "Nome do Fluxo de Trabalho" ou "Nome"  
Type: Text Input  
Placeholder: "ex: Desenvolvimento, Marketing, Suporte"  
Validation:  
  \- Required (obrigatório)  
  \- Min: 3 caracteres  
  \- Max: 100 caracteres  
  \- Unique (não pode duplicar no mesmo workspace)  
  \- No special chars (só letras, números, espaços, hífens)  
Help Text: "Nome único que identifica este fluxo"  
\`\`\`

\#\#\# \*\*Campo 2: Descrição\*\*  
\`\`\`  
Label: "Descrição" ou "Detalhes"  
Type: Textarea ou Text Input  
Placeholder: "ex: Fluxo para tarefas de desenvolvimento backend"  
Validation:  
  \- Optional (não obrigatório)  
  \- Max: 500 caracteres  
Help Text: "Descreva o propósito deste fluxo de trabalho"  
\`\`\`

\#\#\# \*\*Campo 3: Fluxo Padrão\*\*  
\`\`\`  
Label: "Fluxo Padrão?"  
Type: Toggle / Radio Button / Checkbox  
Options:  
  \- ☑ Sim (Este será o fluxo selecionado por padrão)  
  \- ☐ Não (Usuário deve selecionar manualmente)  
Default: Não  
Validation:   
  \- Apenas UM fluxo pode ser padrão por workspace  
  \- Se marcar Sim em outro, o anterior é desmarcado  
Help Text: "Fluxo padrão selecionado automaticamente ao criar tarefas"  
\`\`\`

\#\#\# \*\*Campo 4: Status / Situação\*\*  
\`\`\`  
Label: "Status" ou "Situação"  
Type: Radio Button ou Toggle  
Options:  
  \- ☑ Ativo (🟢 disponível para usar)  
  \- ☐ Inativo (⚫ oculto, não aparece no dropdown)  
Default: Ativo  
Validation: Required  
Help Text: "Fluxos inativos não aparecem ao criar tarefas"  
Business Rule:  
  \- Se tentar inativar um fluxo com tarefas ativas:  
    \- Mostrar aviso: "Este fluxo tem X tarefas ativas"  
    \- Permitir? Sim / Não  
    \- Se sim: tarefas continuam, mas novo fluxo não pode ser criado  
\`\`\`

\---

\#\# \*\*7. GERENCIAR FASES DENTRO DO FLUXO\*\*

\#\#\# \*\*Estrutura de uma Fase\*\*

Cada fase tem:

\#\#\#\# \*\*7.1 Nome da Fase\*\*  
\`\`\`  
Label: "Nome da Fase"  
Type: Text Input  
Placeholder: "ex: À fazer, Em progresso, Concluído"  
Validation:  
  \- Required (obrigatório)  
  \- Min: 2 caracteres  
  \- Max: 50 caracteres  
  \- Unique dentro deste fluxo (não pode ter 2 "Backlog")  
Help Text: "Nome da etapa que a tarefa vai passar"  
\`\`\`

\#\#\#\# \*\*7.2 Ícone da Fase\*\*  
\`\`\`  
Label: "Ícone"  
Type: Icon Picker (seletor visual)  
Options: \[🔵 Backlog\] \[🟡 Progress\] \[🔴 Blocked\] \[🟢 Done\] \[⚫ Cancelled\] \[etc...\]  
Default: 🔵 (círculo azul)  
Validation: Required  
Help Text: "Ícone para identificar visualmente a etapa"  
Purpose: Aparecer no Kanban, Lista, etc  
\`\`\`

\#\#\#\# \*\*7.3 Cor da Fase\*\*  
\`\`\`  
Label: "Cor"  
Type: Color Picker  
Default: \#0099FF (azul)  
Validation: Valid hex color  
Help Text: "Cor para diferenciar fases no Kanban"  
Used In:  
  \- Kanban: background da coluna  
  \- Gráficos: cores diferentes para cada fase  
  \- Status visual  
\`\`\`

\#\#\#\# \*\*7.4 SLA (Service Level Agreement)\*\*  
\`\`\`  
Label: "SLA" ou "Tempo máximo (dias)"  
Type: Number Input  
Default: Empty (sem limite)  
Validation:  
  \- Optional (não obrigatório)  
  \- Number \> 0  
  \- Max: 999 dias  
Help Text: "Tempo máximo que uma tarefa deve ficar nesta fase"  
Example:  
  \- Se fase "Em Progresso" tem SLA de 5 dias  
  \- E tarefa fica 6 dias, mostra: "Atrasado ⚠️"  
Purpose:  
  \- Alertar quando tarefa ultrapassa o prazo  
  \- Relatório: "X tarefas atrasadas"  
\`\`\`

\#\#\#\# \*\*7.5 É Fase Final?\*\*  
\`\`\`  
Label: "É fase final?" ou "Fase de conclusão?"  
Type: Checkbox / Toggle  
Default: ☐ Não  
Validation:  
  \- Pelo menos UMA fase deve ser final  
  \- Múltiplas podem ser finais (ex: "Concluído" E "Cancelado")  
Help Text: "Marcar fases que indicam conclusão da tarefa"  
Business Logic:  
  \- Quando tarefa move para fase final:  
    ├─ Status muda para "Concluído/Finalizado"  
    ├─ Data de conclusão é registrada  
    ├─ Notificação enviada  
    └─ Começa a contar tempo total (desde criação até conclusão)  
\`\`\`

\#\#\#\# \*\*7.6 Ordem / Sequência\*\*  
\`\`\`  
Label: (Implícito \- controle visual)  
Type: Drag & Drop ou Seta ▲ ▼  
Default: Ordem de criação  
Validation:  
  \- Primeira fase é obrigatória na posição 1  
  \- Fase final deve estar no fim (não obrigatório, mas recomendado)  
Help Text: "Arraste para reordenar as fases"  
Example:  
  1️⃣ Backlog (fase inicial)  
  2️⃣ Em Progresso  
  3️⃣ Concluído (fase final)  
  4️⃣ Cancelado (fase final alternativa)  
\`\`\`

\---

\#\# \*\*8. REGRAS DE NEGÓCIO \- FLUXO DE TRABALHO\*\*

\#\#\# \*\*✅ CRIAÇÃO\*\*  
\`\`\`  
✓ PODE criar novo fluxo se:  
  ├─ Tem permissão (Admin/Editor)  
  ├─ Nome não é duplicado  
  ├─ Tem pelo menos 1 fase  
  └─ Tem pelo menos 1 fase final

✗ NÃO PODE criar se:  
  ├─ Nome vazio  
  ├─ Sem fases  
  └─ Sem fase final  
\`\`\`

\#\#\# \*\*✏️ EDIÇÃO\*\*  
\`\`\`  
PERMITIDO:  
  ├─ Editar nome, descrição  
  ├─ Mudar fluxo padrão (afeta apenas novas tarefas)  
  ├─ Adicionar/remover/reordenar fases  
  ├─ Editar propriedades de fases (nome, cor, ícone, SLA)  
  └─ Ativar/Inativar (com aviso se tem tarefas)

RESTRIÇÕES:  
  ├─ Se tentar remover fase com tarefas ativas:  
  │  └─ Sistema avisa: "X tarefas nesta fase"  
  │     "Mover para qual fase?"  
  │     (obrigar a reatribuir antes)  
  │  
  └─ Se fase é final, não pode remover se é única:  
     └─ "Erro: fluxo deve ter pelo menos 1 fase final"  
\`\`\`

\#\#\# \*\*🗑️ DELEÇÃO\*\*  
\`\`\`  
NÃO pode deletar fluxo se:  
  ├─ Tem tarefas ativas  
  ├─ É o fluxo padrão (deve escolher outro antes)  
  └─ É o único fluxo ativo

PODE deletar se:  
  └─ Não tem tarefas referenciando-o

SOFT DELETE vs HARD DELETE:  
  Provavelmente usa soft delete (marca como inativo)  
  └─ Tarefas antigas continuam visíveis com o fluxo antigo  
\`\`\`

\---

\#\# \*\*9. VISUALIZAÇÃO E ESTRUTURA NA LISTA\*\*

\`\`\`  
TABELA DE FLUXOS:  
┌────┬─────────────┬──────────────┬────────┬───────┬────────┐  
│ ☐  │ Fluxo       │ Criado por   │ Criado │ Ativo │ Padrão │  
├────┼─────────────┼──────────────┼────────┼───────┼────────┤  
│ ☐  │ Desenvolv. │ Eliezer T.   │ Jan 20 │ ✓     │        │  
├────┼─────────────┼──────────────┼────────┼───────┼────────┤  
│ ☐  │ Marketing  │ Eliezer T.   │ Jan 20 │ ✓     │ ✓      │  
├────┼─────────────┼──────────────┼────────┼───────┼────────┤  
│ ☐  │ Suporte    │ Eliezer T.   │ Feb 05 │       │        │  
└────┴─────────────┴──────────────┴────────┴───────┴────────┘  
  ↑         ↑            ↑           ↑        ↑       ↑  
 Seleção  Nome      Criador    Data    Status Padrão  
\`\`\`

\*\*Ações na linha:\*\*  
\- ✏️ \*\*Editar\*\* \- Abre form para editar fluxo e fases  
\- 🗑️ \*\*Deletar\*\* \- Remove fluxo (com validações)  
\- 👁️ \*\*Visualizar Fases\*\* \- Expand/collapse para ver fases

\---

\#\# \*\*10. INTEGRAÇÃO COM RESTO DO SISTEMA\*\*

\`\`\`  
FLUXO DE TRABALHO se conecta com:

┌─────────────────────────────────────────────────┐  
│         FLUXO DE TRABALHO                       │  
├─────────────────────────────────────────────────┤  
│              │                                   │  
├──────────────┼──────────────┬──────────────┐     │  
│              ▼              ▼              ▼     │  
│          TAREFAS       TIPOS TAREFA    PROJETOS │  
│              │              │              │     │  
│     ┌────────┴───────┐      │              │     │  
│     ▼                ▼      ▼              ▼     │  
│  FASES      TRANSIÇÕES  VALIDAÇÃO    ASSOCIAÇÃO │  
│     │         (Rules)      │              │     │  
│     │         └─ Ao mover  │              │     │  
│     │           tarefa     │              │     │  
│     │           entre fases│              │     │  
│     │           executa    │              │     │  
│     │           ações      │              │     │  
│     │           automáticas│              │     │  
│     │                      │              │     │  
│     └──────────┬───────────┴──────────────┘     │  
│                ▼                                 │  
│            DASHBOARD                            │  
│            (Kanban, Lista, Gráficos)            │  
│            (mostra fases em ordem)              │  
│                                                  │  
└─────────────────────────────────────────────────┘  
\`\`\`

\---

\#\# \*\*11. EXEMPLO PRÁTICO\*\*

\#\#\# \*\*Fluxo "Desenvolvimento de Features"\*\*

\`\`\`  
CRIAÇÃO:  
┌──────────────────────────────────┐  
│ Nome: "Desenvolvimento"            │  
│ Descrição: "Fluxo para features"  │  
│ Fluxo Padrão: ☐ Não              │  
│ Status: ☑ Ativo                  │  
└──────────────────────────────────┘

FASES (em ordem):  
┌─────────────────────────────────────────┐  
│ 1️⃣ BACKLOG (fase inicial)              │  
│    ├─ Ícone: 🔵 Azul                   │  
│    ├─ SLA: (nenhum)                    │  
│    └─ Final?: Não                      │  
├─────────────────────────────────────────┤  
│ 2️⃣ EM PROGRESSO                        │  
│    ├─ Ícone: 🟡 Amarelo                │  
│    ├─ SLA: 5 dias                      │  
│    └─ Final?: Não                      │  
├─────────────────────────────────────────┤  
│ 3️⃣ CODE REVIEW                         │  
│    ├─ Ícone: 🟣 Roxo                   │  
│    ├─ SLA: 2 dias                      │  
│    └─ Final?: Não                      │  
├─────────────────────────────────────────┤  
│ 4️⃣ TESTE                               │  
│    ├─ Ícone: 🟠 Laranja                │  
│    ├─ SLA: 3 dias                      │  
│    └─ Final?: Não                      │  
├─────────────────────────────────────────┤  
│ 5️⃣ CONCLUÍDO (fase final)              │  
│    ├─ Ícone: 🟢 Verde                  │  
│    ├─ SLA: (nenhum)                    │  
│    └─ Final?: ☑ SIM                    │  
├─────────────────────────────────────────┤  
│ 6️⃣ CANCELADO (fase final alternativa)  │  
│    ├─ Ícone: ⚫ Preto                  │  
│    ├─ SLA: (nenhum)                    │  
│    └─ Final?: ☑ SIM                    │  
└─────────────────────────────────────────┘

USO:  
Quando um desenvolvedor cria tarefa:  
  "Implementar login com 2FA"  
    
├─ Seleciona Workflow: \["Desenvolvimento" ▼\]  
├─ Tarefa começa em: "Backlog" (1º fase)  
├─ Move para "Em Progresso" (2º)  
├─ Move para "Code Review" (3º)  
│  └─ Senior developer faz revisão  
├─ Se OK: Move para "Teste" (4º)  
│  └─ QA testa a feature  
├─ Se tudo OK: Move para "Concluído" (5º) ✓ FINAL  
│  └─ Data de conclusão \= registrada  
│  └─ Tempo total \= de criação até agora  
│  
└─ Se problema encontrado:  
   └─ Pode voltar para "Em Progresso"  
   └─ E depois tentar de novo  
\`\`\`

\---

\#\# \*\*12. STATUS E TRANSIÇÕES\*\*

\#\#\# \*\*Máquina de Estados (State Machine)\*\*

\`\`\`  
Backlog ──→ Em Progresso ──→ Code Review ──→ Teste ──→ Concluído ✓ (FINAL)  
   ↑           │                │            │  
   └───────────┴────────────────┴────────────┘  
            (pode voltar)

Sempre pode ir para:  Cancelado ✓ (FINAL)  
    (de qualquer fase)  
\`\`\`

\---

\#\# \*\*13. DADOS TÉCNICOS (Estrutura Banco de Dados)\*\*

\`\`\`sql  
TABLE Workflow {  
  id: UUID (primary key)  
  name: string (unique per company)  
  description: string (nullable)  
  isDefault: boolean (only 1 per company)  
  isActive: boolean  
  workspaceId: UUID (workspace específico)  
  companyId: UUID (empresa dona)  
  isPublished: boolean (draft vs published)  
  createdBy: UUID (user que criou)  
  createdAt: timestamp  
  updatedAt: timestamp  
  updatedBy: UUID (último a editar)  
}

TABLE Phase {  
  id: UUID (primary key)  
  workflowId: UUID (foreign key → Workflow)  
  name: string  
  icon: string (ex: "play\_circle\_outline")  
  color: hex (ex: "\#0099FF")  
  order: integer (1, 2, 3... posição na sequência)  
  slaHours: integer (nullable, SLA em horas)  
  isFinal: boolean (é fase de conclusão?)  
  createdAt: timestamp  
}

RELATIONSHIPS:  
Workflow (1) ──\< (N) Phase  
    │  
    └─ Company (N) ──\< (1) Company  
      
Phase (1) ──\< (N) Task  
    (tarefa referencia a fase atual)  
\`\`\`

\---

\#\# \*\*14. VALIDAÇÕES E REGRAS\*\*

\`\`\`  
CRIAÇÃO:  
✓ Name: 3-100 caracteres, único  
✓ Mínimo 2 fases  
✓ Pelo menos 1 fase final (isFinal \= true)  
✓ Primeira fase não pode ser final (padrão dev)

EDIÇÃO DE FASES:  
✓ Ao remover fase: avisar tarefas/mover para outra  
✓ Não pode ter 2 fases com mesmo nome  
✓ Ordem válida (não pode pular números)

TRANSIÇÃO DE TAREFAS:  
✓ Tarefa só pode ir para próxima fase na ordem  
✓ Ou para qualquer fase final  
✓ Ou voltar para fase anterior (revert)  
\`\`\`

\---

\#\# \*\*15. COMPARAÇÃO COM "TIPOS DE TAREFA"\*\*

| Aspecto | Fluxo de Trabalho | Tipos de Tarefa |  
|---------|-------------------|-----------------|  
| \*\*O quê\*\* | Caminho que tarefa percorre | Categoria/classificação |  
| \*\*Exemplo\*\* | Backlog → Progresso → Concluído | Bug, Feature, Docs |  
| \*\*Obrigatório\*\* | ✅ SIM (sem não cria tarefa) | ❌ Não |  
| \*\*Quantidade\*\* | Múltiplos fluxos possíveis | Múltiplos tipos |  
| \*\*Padrão\*\* | Um por workspace | Nenhum padrão |  
| \*\*Impacto\*\* | Define workflow inteiro | Apenas classificação |  
| \*\*Complexidade\*\* | ⭐⭐⭐⭐⭐ ALTA | ⭐⭐⭐ MÉDIA |

\---

Pronto\! Essa é uma \*\*análise completa e detalhada do módulo "Fluxo de Trabalho"\*\* no mesmo nível de profundidade que fizemos com "Tipos de Tarefa".

\*\*Próximos passos:\*\*

1\. ✅ Tipos de Tarefa (COMPLETO)  
2\. ✅ Fluxo de Trabalho (COMPLETO)  
3\. ⏳ \*\*Tarefas\*\* (Core principal \- bem mais complexo)  
4\. ⏳ Projetos  
5\. ⏳ Usuários  
6\. ⏳ Workspaces  
7\. E assim por diante...

\*\*Quer que eu continue com "TAREFAS"\*\* ou prefere explorar outro módulo primeiro? 😊  
