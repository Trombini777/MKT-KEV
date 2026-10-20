# Plano de Execução: KEV Studio

Baseado em [CLAUDE.md](../CLAUDE.md), [PRD.md](PRD.md) e no playbook
`../novo projeto/NOVO-PROJETO.md`.

## Metodologia

UI-first com dados mock, depois backend real (Supabase, auth, IA). Cada milestone entrega algo
visível e testável antes do próximo. Um milestone por vez, com check-in do usuário entre eles,
sem datas fixas.

Convenção de branch: `feat/studio-NN-nome-do-milestone`. O prefixo `studio` separa as branches
do Studio das do Sistema de Marketing, já que os dois vivem no mesmo repositório.

**Decisões de arquitetura:**

| Decisão | Escolha | Motivo |
|---|---|---|
| Repositório | Mesmo repositório do Sistema de Marketing ([`Trombini777/MKT-KEV`](https://github.com/Trombini777/MKT-KEV)), com o Studio como segundo app Next.js na pasta `kev-studio/` | Git e GitHub já conectados. Os dois apps evoluem juntos e compartilham schema e tipos. |
| Banco | **Mesmo projeto [Supabase](https://supabase.com)** do Sistema de Marketing, só com tabelas adicionais prefixadas `studio_` | Os dois sistemas conversam direto pelo banco: o encaminhamento ao Marketing é um insert em `tarefas`, e a Fila e o painel de consumo leem as mesmas tabelas. Sem API intermediária. |
| Migrations | Continuam em `supabase/migrations/` na raiz (numeração `0024` em diante) | Uma única fonte de verdade do schema, sem históricos paralelos de migrations no mesmo banco. |
| Áreas | Reaproveita a tabela `departamentos` (29 áreas) | Mesma lista de áreas nos dois sistemas. |
| Auth | Mesmo Supabase Auth. Usuários de BU ficam em `studio_usuarios`, **não** em `colaboradores` | `is_kev_colaborador()` continua significando "time de Marketing". Usuário de BU não enxerga dados internos por RLS. |
| Deploy | Segundo projeto [Vercel](https://vercel.com) apontando para o mesmo repositório, com Root Directory `kev-studio`, no domínio `studio.kevseguros.com.br` | Cada app com seu domínio e build. "Ignored Build Step" evita rebuild de um app quando só o outro mudou. |
| Visual | Tema, logo, favicon e componentes do Sistema de Marketing | Os dois sistemas parecem um só produto KEV. |
| IA | [Claude API](https://www.anthropic.com/api) via [AI SDK](https://ai-sdk.dev) (`@ai-sdk/anthropic`) | Mesmo SDK do assistente keV, saída estruturada com Zod. |
| Marca nos arquivos | Templates KEV em código; a IA só preenche conteúdo | Sustenta a promessa de consistência do slide 05 do pitch. |

---

## Pré-requisitos (fora do código)
**Responsável:** Eliezer, com TI e diretoria
- [ ] Aprovação do orçamento e da BU piloto (com gestor de área indicado)
- [ ] TI e compliance: aval para enviar conteúdo interno das áreas à Claude API e ao Higgsfield
      (dados tratados por terceiros, LGPD)
- [ ] TI: definir o provedor de login corporativo (Microsoft Entra ID ou Google Workspace)
- [ ] TI: registro DNS de `studio.kevseguros.com.br`
- [ ] Verificar o domínio `kevseguros.com.br` no [Resend](https://resend.com). Hoje o envio usa
      o remetente de teste, que só entrega para o e-mail da própria conta, então avisos para as
      BUs não chegariam
- [ ] Contratar créditos da [Claude API](https://www.anthropic.com/pricing) e
      [Higgsfield Ultra](https://higgsfield.ai). Conferir se o Supabase atual já está no plano
      Pro; se estiver, a linha "Supabase Pro" do orçamento do pitch deixa de existir
- [ ] Confirmar com o Higgsfield uso via API e uso comercial pela empresa (**bloqueante para
      M5**; plano B: outra API de imagem ou artes só com layouts gráficos)
- [ ] Marketing: separar 3 a 5 apresentações e artes de referência aprovadas para basear os
      templates

---

## M0: Setup do Projeto e Fundação
**Branch:** `feat/studio-00-setup-fundacao`
**Objetivo:** App do Studio rodando dentro do repositório, com o visual KEV, conectado ao
Supabase existente e com deploy de preview na Vercel.
**Entregas:**
- [x] Agentes e skills de desenvolvimento em `.claude/` (playbook §1.1)
- [x] `CLAUDE.md`, `docs/PRD.md` e `docs/PLAN.md` (playbook §1.2 e §1.3)
- [x] `.gitignore` próprio cobrindo `node_modules`, `.next`, `.env*`, `.vercel/`,
      `.claude/settings.local.json`
- [x] Renomear a pasta `KEV STUDIO` para `kev-studio` (kebab-case, sem espaço, exigido pelo
      Root Directory da Vercel e pelos scripts)
- [x] Branch `feat/studio-00-setup-fundacao` criada no repositório `MKT-KEV`
- [x] App Next.js 16 em `kev-studio/` (App Router, TypeScript, Tailwind 4), montado a partir das
      configs do Sistema de Marketing em vez do `create-next-app`, e shadcn/ui com o mesmo
      `components.json` (`base-nova`, lucide). Porta 3001 no dev, para rodar junto com o
      Sistema de Marketing na 3000
- [x] **Isolar os dois apps no repositório:** adicionar `kev-studio` ao `exclude` do
      `tsconfig.json` raiz e ao `globalIgnores` do `eslint.config.mjs` raiz, senão o
      `tsc --noEmit` e o `eslint` do Sistema de Marketing passam a checar o código do Studio
- [x] **Identidade visual reaproveitada do Sistema de Marketing:** tokens de `globals.css`
      (claro e escuro), `theme-provider.tsx`, `theme-toggle.tsx`, logo (`kev-logo.tsx` e
      `kev-mark.tsx`), favicon (`src/app/icon.png`) e os primitivos de `components/ui/` usados
      (button, card, badge, input, textarea, select, dialog, sheet, tabs, table, progress,
      tooltip, scroll-area, avatar, dropdown-menu, separator, label)
- [x] Clientes Supabase (`client.ts`, `server.ts`, `service-role.ts`) no mesmo padrão do
      Sistema de Marketing, apontando para o mesmo projeto, com `server-only` e variáveis
      validadas por Zod (`src/lib/env.ts`)
- [x] `.env.local` do Studio com as mesmas variáveis do Supabase e as novas
      `ANTHROPIC_API_KEY` e `HIGGSFIELD_API_KEY` (preenchidas pelo usuário, nunca no chat)
- [x] Página inicial de status (identidade, conexão com o Supabase) validada no navegador
- [ ] Projeto Vercel do Studio (Root Directory `kev-studio`, Ignored Build Step) e deploy de
      preview funcionando
- [x] Commit do M0 (`7d1212c` código, `7bd6b70` docs)
**Commit final:** `chore: setup inicial do KEV Studio no repositório`

---

## M1: Telas do Portal (UI-first, dados mock)
**Branch:** `feat/studio-01-telas-mock`
**Objetivo:** Validar a experiência completa do portal com dados mock, fiel às telas
conceituais do pitch, antes de criar as tabelas.
**Entregas:**
- [ ] Layout do Studio: `studio-sidebar.tsx` (base no `app-sidebar.tsx` do Sistema de
      Marketing), busca com atalho ⌘K, usuário com área no rodapé. Seções: **Criar** (Novo
      pedido, Meus pedidos), **Biblioteca** (Biblioteca, Templates KEV), **Gestão** (Consumo,
      Fila do Marketing; visíveis só para gestor de área e admin)
- [ ] **Novo pedido** (slide 02): saudação, caixa de descrição, anexar arquivo, seletor de
      tom, atalhos por tipo, pedidos recentes e consumo da área
- [ ] **Pedido em andamento** (slide 04): conversa à esquerda com resumo da IA (tipo,
      direcionamento, base), "Encaminhar ao Marketing", campo de ajuste; preview e tira de
      miniaturas à direita; botões Editar e Baixar
- [ ] Preview de slides em React com os layouts KEV: capa, tópicos, 3 cards, comparativo,
      número em destaque, contato
- [ ] **Meus pedidos** com status (Gerando, Pronto, Com o Marketing, Erro)
- [ ] **Biblioteca** e **Templates KEV** (catálogo)
- [ ] **Consumo** (slide 07): KPIs do mês, tabela por área com uso de cota, distribuição por
      tipo de material, filtros de mês e área
- [ ] **Fila do Marketing**: pedidos encaminhados com etapa atual
- [ ] Tela de login no padrão visual do Sistema de Marketing
- [ ] Tema claro e escuro em todas as telas
**Commit final:** `feat: telas do KEV Studio com dados mock`
**Check-in:** revisão visual com o usuário e aprovação dos layouts de slide pelo Marketing
antes do M2.

---

## M2: Backend, Login Corporativo e Pedidos
**Branch:** `feat/studio-02-backend-login-pedidos`
**Objetivo:** Trocar os dados mock por tabelas reais no Supabase existente, com login
corporativo e RLS por usuário e área.
**Entregas:**
- [ ] Migration `0024_studio_schema.sql` com as tabelas adicionais:
      `studio_usuarios` (auth_user_id, nome, email, departamento_id → `departamentos`, papel:
      colaborador | gestor_area | admin),
      `studio_templates` (tipo, nome, layout_key, ativo, ordem),
      `studio_pedidos` (usuário, departamento, descrição, anexos, tom, tipo_material,
      complexidade, status, template, `tarefa_id` → `tarefas`, criado_em, entregue_em),
      `studio_mensagens` (histórico de ajustes por chat),
      `studio_versoes` (conteudo_json validado por Zod, caminho do arquivo),
      `studio_consumo` (agente, modelo, tokens de entrada e saída, créditos de imagem, custo
      estimado),
      `studio_cotas` (departamento, mês, limites de pedidos, tokens e créditos)
- [ ] Migration `0025_studio_rls.sql`: funções `security definer` `is_studio_usuario()`,
      `studio_departamento_atual()` e `is_studio_gestor()`, no mesmo padrão de
      `is_kev_colaborador()`. Colaborador vê os próprios pedidos, gestor vê a área, time de
      Marketing (`is_kev_colaborador()`) vê tudo. `studio_consumo` e `studio_cotas` gravados só
      pelo servidor
- [ ] Buckets privados `studio-materiais` e `studio-anexos`, download por URL assinada
- [ ] Login corporativo via Supabase Auth (OAuth do provedor definido nos pré-requisitos),
      restrito a `@kevseguros.com.br`, com as URLs de redirecionamento dos dois domínios
      cadastradas. Primeiro acesso pede a área. Plano B: link mágico restrito ao domínio
- [ ] `proxy.ts` do Studio: guard de rota, com Gestão só para gestor e admin
- [ ] **No Sistema de Marketing:** `proxy.ts` passa a exigir que o usuário logado seja
      colaborador. Hoje ele só confere se há sessão, e com o Auth compartilhado um usuário de
      BU conseguiria abrir as telas internas (vazias por RLS, mas acessíveis)
- [ ] Types do Supabase regenerados e usados nos dois apps
- [ ] Criação de pedido, upload de anexos e Meus pedidos com dados reais
- [ ] Script de teste de RLS autenticando como usuários reais de áreas diferentes e como
      colaborador do Marketing (`admin.generateLink` + `verifyOtp`), com limpeza dos dados no
      final
**Commit final:** `feat: tabelas do Studio, login corporativo e pedidos`

---

## M3: Agente de Roteamento e Encaminhamento ao Marketing
**Branch:** `feat/studio-03-roteamento-encaminhamento`
**Objetivo:** A IA entende o pedido e decide entre gerar no portal ou encaminhar ao Marketing.
**Entregas:**
- [ ] `src/lib/agentes/marca-kev.ts`: guia de marca dos agentes (tom de voz, nome correto KEV,
      termos proibidos, regras de título, exemplos aprovados pelo Marketing)
- [ ] Agente de Roteamento com `generateObject` e Zod:
      `{ tipo_material, complexidade, template_sugerido, resumo, briefing }`. Modelo leve.
- [ ] Regra: campanha, vídeo ou complexidade estratégica não geram; o portal mostra o briefing
      e oferece o encaminhamento
- [ ] Registro de consumo por chamada e checagem de cota antes de executar
- [ ] **Encaminhar ao Marketing pelo banco:** função `security definer`
      `studio_encaminhar_pedido(pedido_id)` que cria a linha em `tarefas` com
      `origem = 'Solicitação'`, `fase_atual_id = 'solicitacoes'`, departamento da BU, nome e
      e-mail do solicitante, briefing da IA e link do pedido, e grava o `tarefa_id` no pedido.
      O usuário de BU não ganha permissão de escrita direta em `tarefas`
- [ ] E-mail de nova solicitação disparado com a mesma lógica de `email-solicitacao.ts`
- [ ] No Sistema de Marketing: selo "via KEV Studio" e link para o pedido no detalhe da tarefa
- [ ] Status "Com o Marketing" com a etapa atual lida de `tarefas`
**Commit final:** `feat: roteamento por IA e encaminhamento ao Marketing`

---

## M4: Gerador de Apresentações
**Branch:** `feat/studio-04-apresentacoes`
**Objetivo:** Do pedido ao .pptx no template KEV em poucos minutos.
**Entregas:**
- [ ] Layouts KEV em [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) espelhando os layouts
      React do M1, com logo vetorial oficial, paleta e fonte segura (sem PP Mori)
- [ ] Agente de Apresentações: lista de slides
      `{ layout, titulo, subtitulo, bullets[], destaque }` validada por Zod
- [ ] Preview na tela, geração do .pptx no servidor e upload no bucket `studio-materiais`
- [ ] Ajuste por chat: cada mensagem gera nova versão; versões anteriores preservadas
- [ ] Streaming do status ("entendendo o pedido", "montando slides", "pronto")
- [ ] Teste com as apresentações de referência separadas pelo Marketing
**Commit final:** `feat: gerador de apresentações no template KEV`

---

## M5: Geradores de Artes e Textos
**Branch:** `feat/studio-05-artes-textos`
**Objetivo:** Artes em PNG e textos ou documentos revisados, sempre na identidade KEV.
**Entregas:**
- [ ] Cliente do [Higgsfield](https://higgsfield.ai) com timeout, retentativa e registro de
      créditos
- [ ] Agente de Artes: `{ headline, apoio, cta, prompt_imagem, formato }`
- [ ] Composição final com [`next/og`](https://nextjs.org/docs/app/api-reference/functions/image-response)
      e [sharp](https://sharp.pixelplumbing.com): a imagem da IA entra como fundo, e logo,
      grid e tipografia KEV são aplicados pelo código. Formatos 1080x1080, 1080x1920 e 1200x628
- [ ] Agente de Textos: criação (e-mails, comunicados) e revisão de .docx com
      [mammoth](https://github.com/mwilliamson/mammoth.js) (leitura) e [`docx`](https://docx.js.org)
      (escrita), preservando a estrutura
- [ ] Download de PNG, .docx e texto copiável
**Commit final:** `feat: geradores de artes e textos na identidade KEV`

---

## M6: Consumo, Cotas e Governança
**Branch:** `feat/studio-06-consumo-governanca`
**Objetivo:** Controle de uso e custo por usuário e área, como prometido no slide 07 do pitch.
**Entregas:**
- [ ] Tela Consumo com dados reais: pedidos, tokens, créditos, custo estimado, entrega média,
      % encaminhado ao Marketing, por área e por tipo de material; exportação CSV
- [ ] Configuração de cotas mensais por área (admin), bloqueio ao atingir o limite e alerta a
      80% por e-mail via [Resend](https://resend.com)
- [ ] Fila do Marketing com a etapa real de cada tarefa encaminhada
- [ ] Biblioteca da área com materiais reais
- [ ] **No Sistema de Marketing:** card "KEV Studio" em Dashboards lendo direto de
      `studio_pedidos` e `studio_consumo` (pedidos, consumo e encaminhados do mês)
**Commit final:** `feat: consumo, cotas e governança do KEV Studio`

---

## M7: Piloto com a BU
**Branch:** `feat/studio-07-ajustes-piloto`
**Objetivo:** Validar o portal com usuários reais antes de abrir para todas as áreas.
**Entregas:**
- [ ] Deploy em `studio.kevseguros.com.br` e cadastro dos usuários da BU piloto
- [ ] Onboarding de 30 minutos com a BU
- [ ] Revisão diária, pelo Marketing, de uma amostra dos materiais gerados (qualidade e marca)
- [ ] Ajustes em `marca-kev.ts`, prompts e layouts a partir do feedback
- [ ] Medição: tempo de entrega, % encaminhado, tokens por pedido, satisfação da BU
**Commit final:** `fix: ajustes do piloto do KEV Studio`

---

## M8: Go-live e Avaliação de 30 Dias
**Branch:** `feat/studio-08-go-live`
**Objetivo:** Portal aberto para todas as áreas, com custo e resultado acompanhados.
**Entregas:**
- [ ] Cotas iniciais definidas para cada área e usuários liberados
- [ ] Checklist de segurança completo (pre e post-push) e revisão `/code-review` em nível high
- [ ] Atualizar a projeção de custo recorrente do pitch com os dados reais de `studio_consumo`
- [ ] Avaliação de 30 dias: pedidos atendidos, horas devolvidas ao Marketing, consumo por área
**Commit final:** `chore: go-live do KEV Studio`

---

## Riscos

| Risco | Mitigação |
|---|---|
| Higgsfield sem API ou com restrição de uso comercial | Validar nos pré-requisitos. Plano B: outra API de imagem ou artes só com layouts gráficos. |
| Login corporativo depende de TI | Acionar nos pré-requisitos. Plano B: link mágico restrito ao domínio. |
| Banco compartilhado: migration do Studio afetar o Sistema de Marketing | Tabelas e funções sempre prefixadas `studio_`; nenhuma alteração em tabelas existentes sem revisão; teste de RLS dos dois perfis a cada migration. |
| Usuário de BU acessando o Sistema de Marketing | Fora de `colaboradores` (RLS bloqueia os dados) e guard por perfil no `proxy.ts` do Sistema de Marketing (M2). |
| Qualidade das apresentações | Layouts fixos aprovados no M1; a IA só preenche conteúdo; revisão diária no piloto. |
| Consumo acima da projeção | Cotas por área, registro por chamada, modelo leve no roteamento, alerta a 80%. |
| Atraso nos geradores | O piloto pode começar só com apresentações e textos; artes entram quando o M5 estiver estável. |
