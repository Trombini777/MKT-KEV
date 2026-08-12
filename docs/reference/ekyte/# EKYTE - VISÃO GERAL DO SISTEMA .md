\# EKYTE \- VISÃO GERAL DO SISTEMA  
\#\# Arquitetura Completa e Guia de Navegação

\---

\#\# 1\. INTRODUÇÃO

eKyte é um sistema de gerenciamento de marketing digital criado para equipes pequenas e médias gerenciarem projetos, tarefas, produtividade e análises em um único lugar.

\*\*Para:\*\* Equipes de marketing (5-8 pessoas por equipe, até 14 BUs em uma organização como Kev Seguros)

\*\*Objetivo:\*\* Centralizar gestão de projetos, equipes, fluxos de trabalho e oferecer visibilidade total de produtividade via dashboards em tempo real.

\*\*Valor Proposto:\*\* Menos Jira complexo, mais simples e direto ao ponto para marketing.

\---

\#\# 2\. ESTRUTURA GERAL DO SISTEMA

O eKyte é estruturado em 9 MÓDULOS principais que trabalham juntos:

WORKSPACE (Camada 1: Organização)  
 │  
 ├─ MODULO 1: WORKSPACES  
 │ └─ Define Business Units / Projetos / Clientes  
 │  
 ├─ MODULO 2: EQUIPES E PROFISSIONAIS  
 │ └─ Quem trabalha, em quais equipes, com quais skills  
 │  
 ├─ MODULO 3: FLUXO DE TRABALHO (Fases/Etapas)  
 │ └─ Como o trabalho flui: Backlog → Design → Review → Publicação  
 │  
 ├─ MODULO 4: TIPOS DE TAREFA  
 │ └─ Categorias de tarefas: Content, Design, Social, etc  
 │  
 ├─ MODULO 5: TAREFAS (Unidade de trabalho)  
 │ └─ As tarefas em si, atribuídas a pessoas, em fases  
 │  
 ├─ MODULO 6: PROJETOS (Agrupamento de tarefas)  
 │ └─ Agrupa tarefas em projetos maiores/campanhas  
 │  
 ├─ MODULO 7: USUÁRIOS E PERMISSÕES  
 │ └─ Quem tem acesso, com qual role, que pode fazer  
 │  
 ├─ MODULO 8: CANAIS E INTEGRAÇÕES  
 │ └─ Conecta com Slack, Email, Teams para notificações  
 │  
 └─ MODULO 9: DATA-DRIVEN (ANALYTICS)  
 └─ Dashboards de produtividade e performance

\---

\#\# 3\. FLUXO DE DADOS: COMO TUDO FUNCIONA JUNTO

\#\#\# Diagrama Mental:

VOCÊ TEM UM WORKSPACE (BU-Seguros Auto)  
 │  
 ├─ DENTRO tem EQUIPES (Design Team, Copywriting Team)  
 │ └─ Cada equipe tem PROFISSIONAIS (João, Maria, Pedro)  
 │ └─ Cada profissional tem SKILLS/TAGS (JavaScript, Design, etc)  
 │  
 ├─ DENTRO define FLUXO DE TRABALHO (Backlog → Design → Review → Publicação)  
 │ └─ Cada ETAPA pode ter PROFISSIONAIS alocados  
 │  
 ├─ DENTRO define TIPOS DE TAREFA (Content, Design, Social, etc)  
 │ └─ Cada tipo vai passar por certas ETAPAS  
 │  
 ├─ VOCÊ CRIA PROJETOS (Campanha Natal, Rebranding, etc)  
 │ └─ Cada projeto tem TAREFAS  
 │ └─ Cada TAREFA:  
 │ ├─ É de um TIPO (Design, Content, etc)  
 │ ├─ Está em uma ETAPA do fluxo  
 │ ├─ É atribuída a um PROFISSIONAL  
 │ ├─ Tem uma DATA DE VENCIMENTO  
 │ └─ Tem uma URGÊNCIA (Alta, Média, Baixa)  
 │  
 └─ VOCÊ MONITORA TUDO via DATA-DRIVEN  
 ├─ Gestão de Produtividade (visão geral)  
 ├─ Atividades por Workspace (por BU)  
 ├─ Atividades por Executor (por pessoa)  
 └─ Atividades por Etapa (gargalos)

\#\#\# Exemplo Prático (Kev Seguros):

WORKSPACE: "BU-Seguros Auto"

EQUIPE: "Design Team"  
 ├─ João (Designer Senior)  
 │ └─ Skills: Figma, UI/UX, Branding  
 ├─ Maria (Designer Junior)  
 │ └─ Skills: Figma, Social Media Design

FLUXO DE TRABALHO:

1. Backlog (entrada)  
2. Design (João e Maria trabalham aqui)  
3. Review (Carlos, revisor)  
4. Publicação (Rafael, publicador)  
5. Arquivado (concluído)

TIPO DE TAREFA: "Social Media Design"

PROJETO: "Campanha Primavera"

TAREFA:

* Nome: "Design banner para Instagram"  
* Tipo: Social Media Design  
* Atribuída a: Maria  
* Etapa atual: Design  
* Vencimento: 15/08/2026  
* Urgência: Alta

MONITORAR:

* Data-Driven → Atividades por Workspace  
* Vê: "BU-Seguros Auto tem 3 tarefas atrasadas"  
* Ação: Conversa com líderes de equipe

\---

\#\# 4\. OS 9 MÓDULOS EXPLICADOS (Visão Geral)

\#\#\# MODULO 1: WORKSPACES  
\*\*O que é:\*\* Divisão física do seu sistema. Cada Workspace é isolado dos outros.

\*\*Para Kev:\*\* Cada BU é um Workspace  
\- Workspace: "BU-Seguros Auto"  
\- Workspace: "BU-Seguros Residencial"  
\- ... (14 workspaces \= 14 BUs)

\*\*Por quê:\*\* Isolamento total. BU-Auto não vê tarefas de BU-Vida.

\*\*Link completo:\*\* \[Ver documento detalhado de WORKSPACES\]

\---

\#\#\# MODULO 2: EQUIPES E PROFISSIONAIS  
\*\*O que é:\*\* Quem trabalha? Em quais equipes? Com quais skills?

\*\*Estrutura:\*\*  
\- Workspace \> Squad \> Equipe \> Profissional

\*\*Exemplo:\*\*

BU-Seguros Auto (Workspace)  
 └─ Marketing Squad  
 ├─ Design Team  
 │ ├─ João (Backend Developer skill)  
 │ └─ Maria (React skill)  
 └─ Content Team  
 ├─ Sandra (Copywriting skill)  
 └─ Rafael (SEO skill)

\*\*Por quê:\*\* Organizar quem faz o quê, skills de cada um, carga de trabalho.

\*\*Link completo:\*\* \[Ver documento detalhado de EQUIPES E PROFISSIONAIS\]

\---

\#\#\# MODULO 3: FLUXO DE TRABALHO (Fases/Etapas)  
\*\*O que é:\*\* Defina como o trabalho se move: Backlog → Design → Review → Publicação

\*\*Exemplo:\*\*

Etapa 1: Backlog (Entrada)  
 Etapa 2: Design (Trabalho acontece aqui)  
 Etapa 3: Review (Validação)  
 Etapa 4: Publicação (Saída)  
 Etapa 5: Arquivado (Concluído)

\*\*Por quê:\*\* Saber em qual etapa cada tarefa está. Identificar gargalos (qual etapa demora muito).

\*\*Link completo:\*\* \[Ver documento detalhado de FLUXO DE TRABALHO\]

\---

\#\#\# MODULO 4: TIPOS DE TAREFA  
\*\*O que é:\*\* Categorize as tarefas. Exemplo: "Design", "Content", "Social", etc

\*\*Exemplo:\*\*

Tipo: "Social Media Design"  
 Tipo: "Blog Post"  
 Tipo: "Email Campaign"  
 Tipo: "UI Design"  
 Tipo: "SEO Optimization"

\*\*Por quê:\*\* Organizar e filtrar tarefas por tipo. Reportar: "Quantas tarefas de Design temos?".

\*\*Link completo:\*\* \[Ver documento detalhado de TIPOS DE TAREFA\]

\---

\#\#\# MODULO 5: TAREFAS (Unidade de Trabalho)  
\*\*O que é:\*\* A tarefa em si. O trabalho a ser feito.

\*\*Exemplo:\*\*

Tarefa: "Design banner para Instagram \- Campanha Primavera"

* Tipo: Social Media Design  
* Atribuída a: Maria  
* Etapa: Design  
* Vencimento: 15/08/2026  
* Urgência: Alta  
* Projeto: Campanha Primavera

\*\*Por quê:\*\* Centro de todo o sistema. Tudo gira em torno de tarefas.

\*\*Link completo:\*\* \[Ver documento detalhado de TAREFAS\]

\---

\#\#\# MODULO 6: PROJETOS  
\*\*O que é:\*\* Agrupa tarefas em projetos maiores/campanhas.

\*\*Exemplo:\*\*

Projeto: "Campanha Primavera"  
 ├─ Tarefa 1: Design banner Instagram  
 ├─ Tarefa 2: Copywriting post  
 ├─ Tarefa 3: Social scheduling  
 ├─ Tarefa 4: Analytics report  
 └─ (todas relacionadas à mesma campanha)

\*\*Por quê:\*\* Visão holística de uma campanha inteira. Saber: "A Campanha Primavera tem quantas tarefas? Quantas estão atrasadas?".

\*\*Link completo:\*\* \[Ver documento detalhado de PROJETOS\]

\---

\#\#\# MODULO 7: USUÁRIOS E PERMISSÕES  
\*\*O que é:\*\* Quem pode fazer o quê no sistema?

\*\*Exemplo:\*\*

João (Role: Executor)  
 ├─ Pode: Criar tarefas, completar tarefas, comentar  
 ├─ Não pode: Deletar tarefas, editar fluxo

Maria (Role: Manager)  
 ├─ Pode: Criar/editar/deletar tarefas, gerenciar equipe  
 ├─ Não pode: Editar Workspace, mudar permissões

Admin (Role: Admin)  
 └─ Pode: TUDO (criar workspaces, mudar permissões, etc)

\*\*Por quê:\*\* Segurança. Controle de quem faz o quê.

\*\*Link completo:\*\* \[Ver documento detalhado de USUÁRIOS\]

\---

\#\#\# MODULO 8: CANAIS E INTEGRAÇÕES  
\*\*O que é:\*\* Conecta eKyte com ferramentas externas (Slack, Email, Teams)

\*\*Exemplo:\*\*

Integração com Slack:

* Quando tarefa é atribuída → notificação no Slack  
* Quando tarefa vence → lembrete no Slack  
* Quando comentário é adicionado → notification Slack

\*\*Por quê:\*\* Equipe fica atualizada sem ficar refrescando eKyte.

\*\*Link completo:\*\* \[Ver documento detalhado de CANAIS E INTEGRAÇÕES\] (versão mini)

\---

\#\#\# MODULO 9: DATA-DRIVEN (ANALYTICS) ⭐  
\*\*O que é:\*\* Dashboards de produtividade e performance.

\*\*4 Dashboards Principais:\*\*  
1\. \*\*Gestão de Produtividade\*\* → Saúde geral da equipe  
2\. \*\*Atividades por Workspace\*\* → Performance de cada BU  
3\. \*\*Atividades por Executor\*\* → Performance de cada pessoa  
4\. \*\*Atividades por Etapa\*\* → Identificar gargalos

\*\*Por quê:\*\* Saber se está tudo ok, quem está sobrecarregado, qual BU tem problema.

\*\*Link completo:\*\* \[Ver documento detalhado de DATA-DRIVEN\]

\---

\#\# 5\. RELACIONAMENTOS ENTRE MÓDULOS

\#\#\# WORKSPACE é a base de tudo

Workspace (BU-Seguros Auto)  
 │  
 ├─ Contém EQUIPES E PROFISSIONAIS  
 ├─ Define FLUXO DE TRABALHO  
 ├─ Define TIPOS DE TAREFA  
 ├─ Contém PROJETOS  
 │ └─ Que contêm TAREFAS  
 ├─ Tem USUÁRIOS com permissões diferentes  
 ├─ Conecta com CANAIS (Slack, etc)  
 └─ Alimenta DATA-DRIVEN com dados

\#\#\# FLUXO DE TRABALHO \+ TIPO DE TAREFA \= Rota da Tarefa

Tarefa de Tipo "Social Design"  
 vai passar por Etapas:  
 Backlog → Design → Review → Publicação → Arquivado

Cada Etapa pode ter PROFISSIONAIS alocados:  
 ├─ Design: João, Maria  
 ├─ Review: Carlos  
 └─ Publicação: Rafael

\#\#\# TAREFA \= Ponto de convergência

1 Tarefa reúne:

* PROJETO (qual campanha?)  
* TIPO (qual tipo de trabalho?)  
* EQUIPE (qual equipe?)  
* PROFISSIONAL (quem faz?)  
* FLUXO (qual etapa?)  
* USUÁRIO (quem pode ver/editar?)  
* DATA (quando vence?)

\#\#\# DATA-DRIVEN \= Inteligência sobre tudo

Data-Driven agrega dados de:

* TAREFAS (quantas, quantas atrasadas)  
* PROFISSIONAIS (produtividade de cada um)  
* FLUXO (qual etapa é gargalo)  
* WORKSPACE (qual BU está ok)  
* TIPOS (qual tipo de tarefa demora mais)

\---

\#\# 6\. FLUXO TÍPICO DE USO (Dia a dia)

\#\#\# Segunda-feira, 9:00 AM

1. Abre eKyte  
2. Vai em TAREFAS  
3. Vê suas tarefas da semana  
4. Atualiza status de tarefas completadas

\#\#\# Durante a semana

1. Cria PROJETOS para campanhas  
2. Cria TAREFAS dentro dos projetos  
3. Atribui TAREFAS a PROFISSIONAIS  
4. Move TAREFAS entre ETAPAS (Backlog → Design → Review)  
5. Adiciona comentários em tarefas

\#\#\# Quinta-feira, 14:00 PM

1. Abre DATA-DRIVEN  
2. Vê "Gestão de Produtividade" (saúde geral)  
3. Vê "Atividades por Workspace" (cada BU)  
4. Identifica problemas (BUs com atrasos)  
5. Toma ação (conversa com líderes, redistribui tarefas)

\#\#\# Fim de mês

1. Abre DATA-DRIVEN  
2. Vê "Atividades por Executor" (desempenho de cada pessoa)  
3. Usa para feedback e avaliação  
4. Exporta relatório para direção

\---

\#\# 7\. CENÁRIOS DE USO

\#\#\# Cenário 1: Gerenciar 1 equipe (5-8 pessoas)

* 1 Workspace (ou 1 workspace por projeto)  
* 1-2 Equipes  
* Fluxo simples (4-5 etapas)  
* Tipos de tarefas: Design, Content, Social, etc  
* Use Data-Driven: Gestão de Produtividade \+ Atividades por Executor

\#\#\# Cenário 2: Gerenciar 14 BUs (Kev Seguros)

* 14 Workspaces (um por BU)  
* Cada workspace tem suas equipes  
* Fluxo padrão em todas  
* Tipos de tarefas padronizados  
* Use Data-Driven: Atividades por Workspace (para monitorar cada BU)  
* Cada BU pode ter seu próprio "dashboard semanal"

\#\#\# Cenário 3: Gerenciar múltiplos clientes/projetos

* 1 Workspace por cliente  
* Ou 1 Workspace com múltiplos PROJETOS  
* Cada projeto tem suas tarefas  
* Use Data-Driven: Atividades por Workspace (cada cliente \= 1 workspace)

\---

\#\# 8\. GUIA RÁPIDO: "Quero fazer X, como faço?"

\#\#\# "Quero criar uma tarefa"  
1\. Vai em TAREFAS  
2\. Clica "+ Criar Tarefa"  
3\. Preenche: Nome, Tipo, Projeto, Atribui a alguém, Define data, Define urgência  
4\. Move para a etapa correta (arrasta em FLUXO)

\#\#\# "Quero ver o desempenho de João"  
1\. Vai em DATA-DRIVEN  
2\. Abre "Atividades por Executor"  
3\. Seleciona "João"  
4\. Vê: Tarefas concluídas, atrasadas, etapas que trabalhou

\#\#\# "A BU-Auto está com problema, o que fazer?"  
1\. Vai em DATA-DRIVEN  
2\. Abre "Atividades por Workspace"  
3\. Seleciona "BU-Seguros Auto"  
4\. Vê a coluna "Atrasaram" (quantas estão atrasadas?)  
5\. Se \>20% \= problema  
6\. Vai em "Atividades por Etapa" para identificar onde está o gargalo  
7\. Conversa com líderes de equipe

\#\#\# "Qual é meu fluxo de trabalho?"  
1\. Vai em FLUXO DE TRABALHO  
2\. Vê as etapas: Backlog → Design → Review → etc  
3\. Cada tarefa passa por essas etapas

\#\#\# "Minha equipe está sobrecarregada?"  
1\. Vai em DATA-DRIVEN  
2\. Abre "Gestão de Produtividade"  
3\. Vê a tabela "Tarefas até hoje por executor"  
4\. Se alguém tem \>10 tarefas atrasadas \= sobrecarregado

\#\#\# "Quero saber a produtividade de cada BU"  
1\. Vai em DATA-DRIVEN  
2\. Abre "Atividades por Workspace"  
3\. Seleciona "Todas" (vê as 14 BUs)  
4\. Compara: BU-Auto vs BU-Vida vs BU-Residencial

\---

\#\# 9\. ESTRUTURA DE DOCUMENTAÇÃO (Navegação)

Você tem 8 documentos detalhados (1 por módulo principal):

├─ Visão Geral do Sistema (ESTE DOCUMENTO)  
 │ └─ Mostra como tudo funciona junto  
 │  
 ├─ MODULO 1: WORKSPACES  
 │ └─ \[Link para documento completo\]  
 │  
 ├─ MODULO 2: EQUIPES E PROFISSIONAIS  
 │ └─ \[Link para documento completo\]  
 │  
 ├─ MODULO 3: FLUXO DE TRABALHO  
 │ └─ \[Link para documento completo\]  
 │  
 ├─ MODULO 4: TIPOS DE TAREFA  
 │ └─ \[Link para documento completo\]  
 │  
 ├─ MODULO 5: TAREFAS  
 │ └─ \[Link para documento completo\]  
 │  
 ├─ MODULO 6: PROJETOS  
 │ └─ \[Link para documento completo\]  
 │  
 ├─ MODULO 7: USUÁRIOS  
 │ └─ \[Link para documento completo\]  
 │  
 ├─ MODULO 8: CANAIS E INTEGRAÇÕES  
 │ └─ \[Link para documento completo\] (versão mini)  
 │  
 └─ MODULO 9: DATA-DRIVEN ⭐ (MAIS IMPORTANTE)  
 └─ \[Link para documento completo\]

\*\*Como usar:\*\*  
1\. Leia esta página para entender a visão geral  
2\. Quando precisa entender um módulo específico, clique no link correspondente  
3\. Cada documento tem exemplo, guia prático, rotina de uso

\---

\#\# 10\. SEQUÊNCIA DE APRENDIZADO RECOMENDADA

\#\#\# Fase 1: Entender a estrutura (hoje)  
\- Leia "Visão Geral do Sistema" (este documento)  
\- Veja os 9 módulos em alto nível  
\- Entenda como tudo se conecta

\#\#\# Fase 2: Setup inicial (semana 1\)  
\- Configure WORKSPACES (14 para Kev)  
\- Configure EQUIPES E PROFISSIONAIS  
\- Configure FLUXO DE TRABALHO  
\- Configure TIPOS DE TAREFA

\#\#\# Fase 3: Começar a usar (semana 2\)  
\- Crie PROJETOS  
\- Crie TAREFAS  
\- Mova tarefas entre ETAPAS  
\- Atribua TAREFAS a pessoas

\#\#\# Fase 4: Monitorar (semana 3+)  
\- Use DATA-DRIVEN toda segunda  
\- Acompanhe Gestão de Produtividade  
\- Analise cada BU via Atividades por Workspace  
\- Tome decisões data-driven

\---

\#\# 11\. CHECKLIST DE IMPLEMENTAÇÃO (KEV SEGUROS)

\#\#\# Setup Inicial  
☐ Criar 14 Workspaces (um por BU)  
☐ Configurar Equipes em cada Workspace (Design, Content, Social)  
☐ Adicionar Profissionais às equipes  
☐ Definir Fluxo de Trabalho padrão (4-5 etapas)  
☐ Definir Tipos de Tarefa (padrão para todas as BUs)  
☐ Configurar Usuários e Permissões

\#\#\# Operacional (Semanal)  
☐ Segunda 9:00 AM: Revisar "Gestão de Produtividade"  
☐ Quinta 14:00 PM: Analisar "Atividades por Workspace"  
☐ Conforme necessário: Usar "Atividades por Executor" e "Atividades por Etapa"

\#\#\# Mensal  
☐ Executar análise completa de todas as 14 BUs  
☐ Usar dados para feedback com líderes de BU  
☐ Exportar relatório para direção  
☐ Otimizar: Fluxos, tipos de tarefas, equipes

\---

\#\# 12\. TROUBLESHOOTING RÁPIDO

\*\*P: Não consigo ver tarefas da outra BU?\*\*  
R: Correto. Workspaces são isolados. Cada BU vê apenas suas próprias tarefas.

\*\*P: Como faço uma tarefa passar por todas as etapas?\*\*  
R: Arrasta a tarefa entre as etapas no Fluxo de Trabalho.

\*\*P: Como sei se alguém está sobrecarregado?\*\*  
R: Data-Driven → Gestão de Produtividade → vê a tabela de tarefas por executor.

\*\*P: Como acompanho a saúde de cada BU?\*\*  
R: Data-Driven → Atividades por Workspace → Seleciona "Todas" para ver as 14 BUs.

\*\*P: Posso ter múltiplos fluxos?\*\*  
R: Sim. Configure 1 Fluxo padrão e customizes por BU se necessário.

\---

\#\# 13\. RESUMO EXECUTIVO

eKyte \= Workspace \+ Equipes \+ Fluxo \+ Tipos \+ Tarefas \+ Projetos \+ Usuários \+ Canais \+ Data-Driven

\*\*Todos trabalhando juntos para:\*\*  
✓ Organizar trabalho (projetos, tarefas)  
✓ Atribuir trabalho (equipes, profissionais)  
✓ Rastrear progresso (fluxo, etapas)  
✓ Manter comunicação (canais, notificações)  
✓ Medir resultados (data-driven, dashboards)

\*\*Para Kev Seguros:\*\*  
✓ 1 Workspace por BU  
✓ Visibilidade total de todas as 14 BUs  
✓ Produtividade data-driven por BU  
✓ Gestão de recursos centralizada

\*\*Tempo de aprendizado:\*\* 2-3 horas  
\*\*ROI:\*\* Redução de atrasos, melhor distribuição de trabalho, visibilidade total

\---

