# PRD — Sistema de Gestão de Tarefas e Projetos do Marketing (Kev Seguros)

> Rascunho para validação com o usuário antes de virar `docs/PLAN.md`. Baseado na análise do
> Ekyte ([docs/reference/ekyte/00-ANALISE-RESUMO.md](reference/ekyte/00-ANALISE-RESUMO.md)) e
> no contexto trazido em conversa.

## 1. Visão geral

Sistema interno para o time de marketing da **Kev Seguros** (seguradora, time enxuto — até 10
pessoas, só marketing) centralizar toda a gestão de demandas, tarefas e projetos/campanhas,
substituindo a dispersão atual entre planilhas, e-mail, WhatsApp e ferramentas soltas.

Não é uma ferramenta multi-cliente/agência (ao contrário do Ekyte) — é um sistema **interno**,
de uso exclusivo do time de marketing, sem faturamento, sem isolamento de dados entre contas de
cliente, sem lógica de upsell.

## 2. Problema

Hoje a informação está espalhada em várias ferramentas diferentes. Isso gera:
- Falta de um lugar único onde entra toda demanda (venha de um projeto, de outra área da
  empresa, ou de uma solicitação externa).
- Dificuldade de saber, a qualquer momento, o que já foi entregue, o que está em andamento e o
  que está atrasado.
- Planejamento semanal manual e sem visibilidade real de capacidade — não dá pra saber se a
  semana está equilibrada ou se alguém está sobrecarregado até o problema acontecer.
- Nenhuma visão histórica de performance do time ou de cada pessoa.

## 3. Usuários

- **Time de marketing da Kev Seguros** — até 10 pessoas, todas internas. Sem aprovadores
  externos ao time cadastrados como usuários no MVP (pode evoluir depois se compliance/jurídico
  precisar de acesso formal ao sistema).
- Um único nível de "empresa" — não há multi-tenant.

## 4. Conceito central (o que difere de um kanban genérico)

O coração do sistema não é só mover cartão entre colunas — é o ciclo:

```
Origem da demanda → Backlog priorizado → Planejamento semanal (por capacidade)
      → Execução (kanban/etapas) → Entrega → Performance (retrospectiva)
```

1. **Origem da demanda** — toda tarefa nasce de uma origem explícita: **Projeto/Campanha**
   (planejamento interno do marketing) ou **Solicitação** (pedido pontual de uma área, com
   **Departamento/Área solicitante** identificado). Isso é um campo de primeira classe, não um
   detalhe.
2. **Backlog único e priorizado** — lista de tudo que precisa ser feito, com prioridade e
   estimativa de horas por tarefa.
3. **Planejamento semanal** — a partir do backlog priorizado e da capacidade de cada
   colaborador (horas disponíveis na semana), montar a semana de forma equilibrada, permitindo
   ajustes manuais antes de "fechar" o planejamento.
4. **Execução visível** — fluxo real em 8 fases (Solicitações → Triagem ⇄ Aguardando Informações
   → Backlog → Em Execução → Aprovação → Concluído, com Refação voltando de Aprovação pra Em
   Execução), com Kanban, Lista, Calendário e Gantt.
5. **Performance** — depois de executado, dashboards mostram o que foi entregue vs. planejado,
   por pessoa e por etapa, para retrospectiva e ajuste do próximo ciclo.

## 5. Escopo do MVP (epics)

### E1 — Fundação: Tarefas, Fluxo de Trabalho e Tipos de Tarefa
- **Fluxo de trabalho como grafo configurável** (não uma sequência linear simples): cada fase
  define explicitamente para quais outras fases pode ir — necessário porque o fluxo real tem
  desvios (Refação volta de Aprovação pra Em Execução, pulando Backlog; Aguardando Informações é
  um desvio a partir da Triagem que volta pra Triagem). SLA por fase continua existindo, mas é um
  **alerta de processo** ("essa etapa não devia levar mais que N dias de trabalho") — não é mais
  quem define sozinho a data projetada de conclusão da tarefa (ver Previsão de conclusão, abaixo,
  e o motor de fila em E3).
  - **Fluxo padrão do sistema** (baseado no fluxo real já em uso hoje, via Pipefy): Solicitações
    → Triagem ⇄ Aguardando Informações → Backlog → Em Execução → Aprovação → Concluído (final),
    com Refação como desvio de Aprovação de volta pra Em Execução. A Triagem nunca rejeita — só
    prepara: confirma a prioridade real, define quando a atividade começa e avalia se outras
    demandas precisam ser realocadas (aciona o Motor de Sugestão de E3 se necessário) antes de
    liberar pro Backlog.
  - **Modo de execução da fase**: Individual (1 executor — padrão) ou Coletiva (múltiplos
    executores simultâneos — fases tipo Reunião/Briefing).
- Tarefa: título, descrição, tipo (por canal/formato: Post Social, E-mail, Peça para Corretor,
  Banner, Vídeo, Comunicado Interno, Material de Campanha, etc.), **origem** (Projeto/Campanha ou
  Solicitação — ver abaixo), **Departamento/Área solicitante** (só quando origem = Solicitação),
  participantes, prioridade, data de início, etapa atual, checklist,
  anexos, comentários com @menção, histórico de mudanças.
- **Executor por Fase** (substitui um campo único "Responsável" pra tarefa inteira): cada fase
  Individual da tarefa tem seu próprio executor, não necessariamente a mesma pessoa em todas as
  fases (ex.: Marcos executa "Em Execução", Fabrício executa "Aprovação"). Cada combinação
  **Tipo de Tarefa × Fase** tem um **Executor Padrão** configurável, que pré-preenche
  automaticamente ao criar a tarefa — o usuário pode trocar na criação ou quando a tarefa chega
  naquela fase. Fases Coletivas guardam uma lista de executores em vez de um único.
- **Estimativa de horas por fase** (não mais um número único pra tarefa inteira) — cada fase tem
  sua própria estimativa, ligada ao executor daquela fase. É o que permite ao motor de previsão
  (E3) separar quanto tempo é do Marcos e quanto é do Fabrício na mesma tarefa.
- **Origem da demanda**: **Projeto/Campanha** (nasce do planejamento interno, já criada com Tipo
  e Executores definidos por quem planeja — entra direto em Backlog) ou **Solicitação** (pedido
  pontual de uma área — sempre entra em Solicitações → Triagem, nunca direto em Backlog, porque
  não vem com Tipo/Executor definidos). Toda Solicitação carrega um **Departamento/Área
  solicitante** — lista fechada e curada com as áreas da Kev (Agronegócio, Assistência
  Financeira, Bancassurance, Comercial, Diretoria Executiva, Financeiro, Jurídico, Marketing,
  Operações, RH, Sinistros, Tecnologia, e as submarcas/unidades KEV, Autoday, Side, Estrutural,
  Projetos, Conecta, entre outras — ~29 opções no total), separada das Tags livres.
- **Canais de criação de Solicitação** (mesmos campos, dois pontos de entrada):
  - **Formulário público** (sem login) — substitui o Pipefy, pra quem não é usuário do sistema.
  - **Botão "Criar solicitação"** dentro do sistema — pra quando o pedido chegou por outro canal
    (reunião, WhatsApp, ligação) e alguém do marketing registra em nome de quem pediu.
  - Campos: nome do solicitante (opcional), e-mail (obrigatório), Departamento/Área (obrigatório),
    título (obrigatório), descrição (obrigatório), **prioridade sugerida** (obrigatório — Alta /
    Regular / Baixa, com aviso explícito de que não acelera a fila sozinha), justificativa
    (obrigatório só se Alta), anexos (opcional), observações (opcional). A prioridade sugerida
    fica registrada, mas a **Prioridade final** (os 4 níveis do sistema) só é confirmada na
    Triagem.
- **Prazo vs. Previsão de conclusão** — dois campos distintos:
  - **Prazo**: o compromisso. Definido manualmente, fixo até alguém editar explicitamente.
  - **Previsão de conclusão**: campo *calculado*, não editável diretamente. Recalcula
    automaticamente sempre que a fila de execuções do executor de alguma fase da tarefa muda
    (nova execução entra na fila dele, prioridade muda, reatribuição, mudança de capacidade) —
    ver o motor de fila de capacidade em E3. Puramente informativo: recalcular a Previsão nunca
    move o Prazo nem reagenda nada.
  - Quando **Previsão > Prazo**, a tarefa fica sinalizada como **"em risco"** — diferente de
    "atrasada" (que é sobre uma etapa específica ter estourado o próprio SLA).
- **Níveis de prioridade** — Crítica (risco legal/compliance, crise, algo que já deveria estar
  no ar), Alta (prazo apertado, compromisso já assumido com outra área/BU), Normal (padrão,
  fluxo normal da fila) e Baixa (sem prazo definido, best-effort). Usado tanto na ordenação do
  backlog quanto no critério de folga do motor de sugestão (E3).
- Transição de etapa segue exatamente o grafo configurado da fase atual (ver acima) — nunca uma
  fase fora da lista explícita de destinos permitidos. Tipo e Fluxo travados após a criação da
  tarefa (só a Etapa e seu(s) Executor(es) mudam, via transição formal).
- Dependências simples entre tarefas (bloqueante / bloqueada por).
- **Tarefas recorrentes**: configurar recorrência (diária/semanal/mensal) em uma tarefa
  (ex.: "Post semanal Instagram", "Newsletter mensal") e o sistema recria automaticamente a
  próxima ocorrência com a mesma configuração (executores padrão por fase, tipo, estimativas,
  checklist). Entra no MVP — rotina fixa é uma fatia grande do dia a dia do time.
- **Tags**: entidade reutilizável (não texto livre) aplicável a tarefas e projetos, usada para
  filtrar, agrupar e cruzar em relatórios (ex.: "Urgente", "Campanha-Sazonal", nome de BU).
- **Modelos de Checklist**: checklists reutilizáveis (ex.: "Checklist de Aprovação Compliance":
  aprovado por jurídico, revisão ortográfica, aprovação da BU dona do produto) que podem ser
  inseridos em qualquer tarefa, além do checklist ad-hoc já previsto.

### E2 — Projetos/Campanhas
- Projeto como agrupador opcional de tarefas (campanhas: Dia das Mães, IPVA, renovação de
  apólice etc.), com progresso automático (%) e datas de início/fim.
- Templates de campanha reutilizáveis para ações recorrentes/sazonais.
- **Notas de Encerramento**: campo de texto livre preenchido ao marcar o projeto/campanha como
  concluído — o que funcionou, o que não funcionou, o que ajustar no template pra próxima vez.
  Retrospectiva leve (inspirada em "Lições Aprendidas" do PMBOK, sem o processo formal pesado),
  alimenta a melhoria contínua dos templates acima sem precisar de outra tela.

### E3 — Backlog, Priorização e Planejamento Semanal (o diferencial do sistema)
- **Painel de Trabalho — tela inicial do sistema** (o que a pessoa vê logo após o login). Mistura
  resumo pessoal + fila de trabalho, percorrida de cima pra baixo até o fim do dia:
  1. **Resumo** — minha carga da semana (mini Workload, só a minha linha) e contadores: quantas
     tarefas estão comigo agora, quantas entrando em breve, quantas pendentes de triagem.
  2. **Para executar agora** — lista das execuções de fase onde eu sou o executor atual,
     ordenadas por prioridade + prazo (a mais urgente no topo) — clica na tarefa e já começa.
  3. **Entrando em breve** — o que está prestes a cair na minha fila (próxima execução de fase
     minha que vai liberar, conforme dependências e planejamento da semana).
  4. **Pendente de Triagem** — contador + lista de Solicitações aguardando triagem, **visível a
     todos** (sem diferenciação por perfil no MVP — todo mundo vê a mesma coisa).
  A "Gestão de Produtividade" (E6) continua existindo como dashboard, mas deixa de ser a tela
  inicial — vira um relatório à parte (visão do time inteiro, não só a minha), a um clique de
  distância.
- Lista/backlog único com todas as demandas pendentes, filtrável e ordenável por prioridade.
- Cadastro de capacidade diária/semanal por colaborador (horas disponíveis).
- Tela de planejamento semanal: aloca tarefas do backlog nos dias da semana respeitando a
  capacidade de cada pessoa, sinaliza sobrecarga por dia (visual tipo semáforo, ver Workload em
  E4) e **não bloqueia** alocar além da capacidade — só avisa em vermelho. Permite ajuste manual
  antes de confirmar a semana.
- **Motor de Previsão por Fila de Capacidade**: para cada colaborador, simula dia a dia como as
  **execuções de fase** da fila dele (ordenadas por prioridade + folga de prazo) se encaixam
  respeitando a capacidade diária real — não a tarefa inteira, só a(s) fase(s) em que ele é o
  executor. É esse cálculo que alimenta a Previsão de conclusão de cada tarefa (E1), agora
  precisa por pessoa mesmo quando uma tarefa passa por várias mãos (ex.: a carga do Marcos só
  conta o tempo dele em "Em Execução", não o tempo que a tarefa passa parada esperando o
  Fabrício aprovar). Puramente informativo, roda em background, nunca reagenda nada sozinho.
- **Folga de prazo** = `Prazo − Previsão de conclusão`. Quanto menor (ou negativa), maior o
  risco da tarefa furar o compromisso. É o critério usado para decidir, nas sugestões abaixo,
  quais tarefas têm espaço pra ceder lugar a uma mais urgente. É também o que o gestor avalia na
  **Triagem** (ver E1) ao decidir a data de início de uma nova Solicitação.
- **Motor de Sugestão de Replanejamento**: quando uma tarefa nova sobrecarrega a fila de alguém
  ou empurra a Previsão de outra tarefa pra depois do Prazo dela (fica "em risco"), o sistema
  gera uma lista de sugestões concretas (ex.: "mover Tarefa B pra quinta", "Tarefa C tem 3 dias
  de folga, dá pra adiar") — nunca aplica nada sozinho. Cada sugestão é independente: **um
  clique aplica só aquela**, ou o time ignora tudo e ajusta manualmente (arrastar no
  Workload/Kanban, editar prazo, prioridade ou executor da fase, uma tarefa por vez).

### E4 — Visualizações
- Kanban (execução do dia a dia).
- Lista com filtros combináveis (executor da fase atual, tipo, origem, Departamento/Área
  solicitante, prioridade, projeto, squad, tags, situação, prazo).
- Calendário editorial.
- **Workload** — a view mais importante do conjunto. Grade **pessoa × dia** (não agregado por
  semana): cada célula é um dia individual com um indicador de horas alocadas naquela pessoa
  naquele dia, colorido por carga (verde = normal, amarelo = no limite, vermelho = excedeu a
  capacidade). Intervalo de dias selecionável (ex.: próximos 7 / 15 / 30 dias, com toggle
  Dia/Semana/Mês como no Ekyte). **Nunca bloqueia** alocar uma tarefa que estoure a capacidade —
  só sinaliza visualmente e mostra o total de horas do dia, a decisão de redistribuir é do time.
- **Gantt** — timeline com barras por tarefa/projeto e setas de dependência (bloqueante/bloqueada
  por). Entra no MVP.

### E5 — Times e Pessoas
- Cadastro simples de colaborador: nome, e-mail, cargo, skills, capacidade (%/horas semanais),
  status (Ativo/Licença/Inativo). Sem campos de RH pesados (admissão/demissão/custo-hora).
- **Squads**: agrupamento organizacional leve acima do colaborador (ex.: Squad Conteúdo, Squad
  Mídia Paga, Squad Design) — campo de filtro/agrupamento, sem hierarquia extra tipo
  Squad→Equipe→Profissional do Ekyte (time pequeno demais para 3 camadas).
- Tela de configuração do **Executor Padrão por Tipo de Tarefa × Fase** (referencia os
  colaboradores cadastrados aqui) — mora nesta área por depender de quem existe no time, mesmo
  sendo consumida na criação de tarefas (E1).

### E6 — Performance / Dashboards
- "Atividades por Pessoa", "Atividades por Etapa", "Atividades por Squad" e visão geral de
  produtividade (ativas, a vencer, atrasadas, **e em risco** — Previsão > Prazo, ver E1/E3) —
  os relatórios do Ekyte com melhor relação esforço/valor, adaptados de "por BU/Workspace" para
  "por Squad" (dado que BU virou tag, não container).
- "Atividades por Departamento/Área solicitante" — mesma lógica, recortada pelas Solicitações
  (ver E1), útil para o gestor entender quais áreas mais demandam o time de marketing.
- Comparativo planejado vs. entregue por semana (decorre direto do E3).

### E7 — Usuários e Permissões
- 3 perfis: Admin / Editor / Viewer, permissão simples (não granular por campo).
- Login/autenticação interna (sem fluxo de convite complexo tipo agência — time pequeno e fixo).

## 6. Fora de escopo (explicitamente, com justificativa)

- Multi-workspace isolado por BU/"cliente" — decidido manter BU como campo/tag leve em vez de
  container isolado (like os 14 workspaces do material Ekyte); revisar só se surgir necessidade
  real de confidencialidade entre BUs.
- Orçamento e faturamento por projeto/campanha.
- Fluxos de onboarding de cliente externo.
- Permissão granular por campo dentro da tarefa (mantém 3 perfis simples do E7).
- Integrações com Slack/Teams/e-mail (pode entrar em uma fase futura, não no MVP).
- App mobile nativo (web responsivo é suficiente no MVP).
- **Módulos auxiliares do Ekyte adiados para fase 2** (fora do MVP, mas registrados para não
  perder o mapeamento): Modelos de Mensagem, Personas, Públicos, Conhecimento (Boards/base de
  conhecimento), Biblioteca (Artifacts/repositório de assets), Chat com IA integrado.

## 7. Métricas de sucesso do produto (pós-lançamento)

- Time para de usar planilha/WhatsApp para gestão de tarefas — 100% das demandas passam a
  nascer no sistema.
- % de tarefas entregues dentro do prazo por semana (visível no dashboard de performance).
- Planejamento semanal feito dentro do sistema toda semana, com capacidade real refletida.

## 8. Stack proposta

Segue o padrão de referência do playbook (`NOVO-PROJETO.md` §3), ajustado se necessário durante
o `CLAUDE.md`: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui, Supabase
(Postgres + RLS + Auth), Vercel para deploy. Como não há multi-tenant por cliente, o RLS aqui
protege por **usuário autenticado da Kev**, não por workspace/tenant.

**Exceção ao RLS**: o formulário público de Solicitação (E1) é a única rota do sistema acessível
sem login — usa uma policy dedicada de `insert`-only (sem `select`/`update`/`delete`) na tabela
de Solicitações, restrita aos campos do formulário. Nenhuma outra tabela é exposta sem
autenticação.

**Identidade visual**: tema do Tailwind/shadcn segue a marca Kev — verde-limão `#CFF74A` como
accent, preto/cinza/branco como base neutra, logo oficial no layout (ver
`Identidade visual Kev/`). Tipografia usa o padrão do shadcn/ui (Geist) no MVP: a fonte oficial
da marca (PP Mori) está na pasta só sob licença "free for personal use", que não cobre uso em
aplicação da empresa — revisitar se/quando a Kev obtiver licença comercial.
