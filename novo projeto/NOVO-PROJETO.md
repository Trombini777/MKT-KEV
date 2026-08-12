# Novo Projeto — Playbook de Setup e Metodologia

> **Como usar:** no início de um projeto novo (pasta vazia ou recém-criada), diga algo como
> "leia ~/Documents/Claude/NOVO-PROJETO.md e configura o projeto" — a partir daí sigo os
> passos da seção 1 e trabalho pela metodologia da seção 2 no resto do projeto.
>
> Importante sobre como isso funciona de verdade: abrir este arquivo sozinho não "instala"
> nada — ele é um roteiro de comandos e convenções que eu (Claude) sigo quando você me
> aponta pra ele. Agentes e skills viram efetivamente disponíveis quando os arquivos deles
> existem em `.claude/agents/` e `.claude/skills/` do projeto (ou já são globais, ver §0).

---

## 0. O que já é automático nesta máquina/conta (nada a fazer)

- **Plugins habilitados globalmente** (`~/.claude/settings.json` → `enabledPlugins`):
  `stripe`, `vercel`, `frontend-design`, `agno` — já ativos em **qualquer** projeto aberto
  por esta conta, sem precisar reinstalar.
- **Skills globais** (`~/.claude/skills/`, fora de qualquer projeto): `brainstorming`,
  `find-skills`, `funnel-architect`, `copywriting`, `social-media-manager`, `titulos-virais`,
  `roteiro-viral-reels`, `content-calendar-sms`, `data-and-funnel-analytics` — também já
  disponíveis em qualquer projeto.
- **Agentes nativos do Claude Code**: `Explore`, `Plan`, `general-purpose`,
  `claude-code-guide`, `statusline-setup` — sempre disponíveis, não precisam de arquivo.

Só a seção 1.1 abaixo (agentes/skills específicos de dev que moram em
`Documents/Claude/.claude/`) precisa ser copiada pra dentro de cada projeto novo.

---

## 1. Passo a passo do setup

### 1.1 Copiar agentes e skills de desenvolvimento

Fonte (coleção pessoal, atualize esses arquivos lá quando quiser melhorar algo pra todos os
projetos futuros): `/Users/eliezertrombini/Documents/Claude/.claude/`

```bash
mkdir -p .claude/agents .claude/skills
cp "/Users/eliezertrombini/Documents/Claude/.claude/agents/"*.md .claude/agents/
cp -r "/Users/eliezertrombini/Documents/Claude/.claude/skills/"* .claude/skills/
```

Nem tudo se aplica a todo projeto — apagar o que não fizer sentido depois de copiar (ex.:
sem pagamento no produto → remover `payment-integration` e `stripe-integration`).

**Agentes na coleção:**
| Agente | Quando usar |
|---|---|
| `code-reviewer` | Revisão de qualidade, segurança e manutenibilidade de código |
| `frontend-developer` | Construir apps frontend completos (React/Vue/Angular) |
| `ui-ux-designer` | Crítica de UI/UX, acessibilidade, decisões visuais |
| `payment-integration` | Stripe/PayPal, checkout, assinatura, webhooks, PCI |

**Skills na coleção** (`frontend-design` já é global via plugin — não precisa copiar):
| Skill | Quando usar |
|---|---|
| `micro-saas-launcher` | Abordagem indie hacker: validar ideia, MVP rápido, pricing, lançamento |
| `senior-secops` | Segurança de aplicação, scanning de vulnerabilidade, compliance |
| `skill-creator` | Criar/editar/otimizar skills novas |
| `stripe-integration` | Guia completo de Stripe (pagamentos, assinatura, webhooks, edge cases) |
| `supabase-postgres-best-practices` | Performance e boas práticas de schema/query Postgres/Supabase |

### 1.2 Criar o `CLAUDE.md` do projeto

Esse arquivo é lido automaticamente em toda sessão nesse repo — é onde moram as regras que
eu devo seguir sem precisar perguntar de novo. Adaptar o template abaixo (baseado no que
funcionou bem no PipeFlow CRM):

```markdown
# {NOME DO PROJETO}

## Visão geral
{O que o produto faz, pra quem, proposta de valor em 2-3 frases}

## Stack Tecnológica
- Frontend: Next.js 14 (App Router) + React 18 + TypeScript 5
- UI: Tailwind CSS + shadcn/ui
- Backend/API: Next.js API Routes + Server Actions
- Banco de dados + Auth: Supabase (PostgreSQL + Row Level Security + Auth)
- Pagamentos: Stripe (se aplicável)
- E-mail transacional: Resend (se aplicável)
- Deploy: Vercel
- Versionamento: Git + GitHub

## Convenções de código
- TypeScript estrito; evitar `any` — tipar dados do Supabase com types gerados.
- Server Components por padrão; `"use client"` só onde há interatividade real.
- Mutações simples via Server Actions; API Routes só para webhooks/integrações externas.
- Validação com Zod em toda fronteira do sistema (formulários, Server Actions, webhooks).
- Nomenclatura: PascalCase (componentes), camelCase (funções/variáveis), kebab-case (pastas/rotas).
- Estilização só via Tailwind + shadcn/ui — sem CSS solto ou inline styles.
- Toda query ao Supabase respeita isolamento por workspace/tenant via RLS — nunca filtrar
  tenant só no client/query manual.
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`).

## Workflow de Git, deploy e segurança
Sempre que for fazer `git push` ou concluir um milestone:

1. **Antes de subir (pre-push):**
   - Conferir `git status` / `git diff --staged` pra ver exatamente o que vai subir.
   - Garantir que `.env`, `.env.local`, `.env*.local`, `.vercel/` e
     `.claude/settings.local.json` estão no `.gitignore` e não aparecem staged/tracked.
   - Buscar padrões de segredo no que vai ser commitado (`sk_live_`, `sk_test_`, `whsec_`,
     `AKIA...`, JWT, connection strings, `service_role`, senha em texto plano).
2. **Depois de subir (post-push):**
   - `git log --all -p | grep -inE "<padrões>"` no histórico completo, não só no último commit.
   - Comparar `git rev-parse <branch> origin/<branch>` pra confirmar que o que subiu bate
     com o que foi revisado localmente.
3. **Relatório de milestone:** ao finalizar, sempre apresentar o que foi feito e como foi a
   checagem de segurança (pre e post-push).

## Estrutura de pastas
{colar a árvore de pastas real do projeto assim que existir}
```

### 1.3 Criar `docs/PLAN.md`

Isso acontece em três passos, **nessa ordem** — não pular direto pra escrever código:

1. **Rascunhar o plano inteiro primeiro.** A partir da ideia do produto (e do `docs/PRD.md`,
   se existir um), quebrar todo o escopo em milestones sequenciais — do M0 (setup) até o
   último (deploy), não só o próximo passo. Cada milestone com Branch / Objetivo / Entregas
   (checklist) / Commit final, seguindo o esqueleto abaixo.
2. **Mostrar o plano pro usuário antes de tocar em código.** Comprometer-se com um plano de
   vários milestones é uma decisão grande — apresentar o `PLAN.md` rascunhado e perguntar se
   faz sentido, se falta algo, se a ordem está certa. Ajustar antes de começar a executar.
3. **Só depois de confirmado, começar a executar.** Um milestone de cada vez, seguindo a
   metodologia da §2 (branch, implementar, testar, commit, marcar checkbox) — não executar
   vários milestones em sequência sem check-in, mesmo que o plano inteiro já esteja aprovado.

Esqueleto de cada milestone:

```markdown
# Plano de Execução — {Projeto}

Baseado em [CLAUDE.md](../CLAUDE.md) {e PRD.md, se existir}.

## Metodologia
{UI-first com dados mock, depois backend real — ou outra estratégia, se fizer mais sentido
pro projeto} Convenção de branch: `feat/NN-nome-do-milestone`.

---

## M0 — Setup do Projeto e Fundação
**Branch:** `feat/00-setup-fundacao`
**Objetivo:** ...
**Entregas:**
- [ ] ...
**Commit final:** `chore: ...`
```

### 1.4 Plugins (só se for conta/máquina diferente desta)

Normalmente não precisa — já habilitado globalmente nesta conta (§0). Se for outra conta:

```
/plugin marketplace add <marketplace>
/plugin install stripe@claude-plugins-official
/plugin install vercel@claude-plugins-official
```

---

## 2. Metodologia de trabalho

Validada construindo o PipeFlow CRM (SaaS multi-tenant Next.js + Supabase) do zero até
~M12 de um plano de 14 milestones. O que funcionou bem:

### 2.1 Planejamento em milestones
- Quebrar o produto em milestones sequenciais pequenos, cada um com **Branch / Objetivo /
  Entregas (checklist) / Commit final** documentado no `docs/PLAN.md`.
- Estratégia **UI-first**: construir as telas primeiro com dados mock, validar fluxo e
  layout, só depois plugar backend real (Supabase, auth, pagamento). Evita retrabalho de UI
  enquanto o schema ainda está mudando.
- Quando um item do plano é decidido **não fazer**, não deixar em aberto silenciosamente —
  registrar a decisão e o motivo direto no `PLAN.md` (ou remover a linha, se não fizer mais
  sentido nem como registro).
- Revisar o `PLAN.md` de vez em quando pra achar checkboxes desatualizados (itens que já
  foram feitos em outro milestone mas ninguém marcou, ou vice-versa) — vale mais confiar no
  código real do que no que o plano *diz* que está pronto.

### 2.2 Branches, commits e PRs
- Um milestone (ou conjunto coeso de milestones) por branch, nomeada `feat/NN-descrição`.
- Commits em Conventional Commits; separar o commit de **código** do commit de **docs**
  (atualização do `PLAN.md`) quando fizer sentido — fica mais fácil de revisar depois.
- Nunca commitar, dar push, abrir PR, mergear ou apagar branch sem o usuário pedir
  explicitamente — cada uma dessas ações é confirmada separadamente, mesmo que a anterior já
  tenha sido aprovada.
- Ao mergear, seguir o checklist de segurança pre-push e post-push do `CLAUDE.md` (§1.2
  acima) e reportar o resultado em texto.

### 2.3 Segurança
- Nunca pedir pro usuário colar uma chave/segredo no chat — se precisar de uma env var, pedir
  pra ele editar o `.env.local` direto no editor; eu confirmo que a variável existe (sem
  imprimir o valor) via script, não lendo o arquivo inteiro.
- Se um segredo acabar aparecendo no chat (usuário colou por engano, ou eu li o arquivo
  inteiro sem querer), avisar explicitamente e sugerir rotacionar a chave.
- `.env*`, `.vercel/`, `.claude/settings.local.json` sempre no `.gitignore`.

### 2.4 Testes e verificação
- Antes de considerar qualquer mudança "pronta": `tsc --noEmit`, `eslint` e `next build` (ou
  equivalente do stack) limpos.
- Quando não há navegador disponível pra testar a UI de verdade: escrever scripts Node
  descartáveis que testam a lógica de backend contra o banco **real** (não só mock),
  autenticando como um usuário de verdade (ex.: Supabase `admin.generateLink` +
  `verifyOtp` pra simular sessão real e testar RLS de verdade, não só bypass via service
  role) — e sempre **limpar os dados de teste no final** do script.
- Deixar claro pro usuário o que foi verificado automaticamente vs. o que só ele consegue
  confirmar clicando na UI de verdade (não fingir que testou algo que não deu pra testar).

### 2.5 Revisão de código
- Antes de commitar mudanças não triviais, rodar a skill `/code-review` (níveis: low/medium
  pra mudanças pequenas, high/xhigh pra mudanças grandes) e aplicar os achados confirmados
  (`CONFIRMED`/`PLAUSIBLE`) antes de seguir pro commit.
- Achados de convenção (`CLAUDE.md`) só valem quando há uma regra citável — não vale palpite
  de estilo.

### 2.6 Colaboração com o usuário
- Perguntar (não assumir) quando a decisão é genuinamente do usuário — arquitetura ambígua,
  escopo maior que o pedido original, ou qualquer ação difícil de reverter.
- Se o usuário pede pra "testar" algo que não foi construído ainda, não fingir que existe —
  falar claramente o que falta antes de simular um teste.
- Ir documentando as decisões de escopo (o que ficou de fora e por quê) pra não perder o
  contexto depois — o `PLAN.md` é o lugar certo pra isso, não a conversa.

---

## 3. Stack de referência (ponto de partida, não obrigatório)

Funcionou bem no PipeFlow CRM — usar como padrão e ajustar por projeto:

- **Frontend:** Next.js 14 (App Router) + React 18 + TypeScript 5
- **UI:** Tailwind CSS + shadcn/ui (`new-york` ou `default`)
- **Backend/dados:** Supabase (Postgres + RLS + Auth)
- **Pagamentos:** Stripe (Checkout, webhooks, Customer Portal) — quando o produto cobra
- **E-mail transacional:** Resend
- **Drag-and-drop:** @dnd-kit
- **Gráficos:** Recharts
- **Deploy:** Vercel
- **Forms:** react-hook-form + Zod (`@hookform/resolvers/zod`)

---

## 4. Checklist rápido (resumo executável)

1. `mkdir -p .claude/agents .claude/skills && cp ...` (§1.1)
2. Criar `CLAUDE.md` a partir do template (§1.2), preenchendo visão geral e stack real
3. Criar `docs/PRD.md` se o produto precisar de um (fora do escopo deste playbook)
4. `git init` (se ainda não existir) + primeiro commit + repo no GitHub
5. Confirmar que `.gitignore` cobre `.env*`, `.vercel/`, `.claude/settings.local.json`
6. Rascunhar `docs/PLAN.md` **inteiro**, do M0 ao último milestone (§1.3, passo 1)
7. Apresentar o plano pro usuário e ajustar antes de começar a codar (§1.3, passo 2)
8. Só então começar a executar M0, um milestone de cada vez, pela metodologia da §2
