# Sistema de Gestão de Marketing — Kev Seguros

@AGENTS.md

## Visão geral

Sistema interno de gestão de tarefas, projetos e capacidade para o time de marketing da Kev
Seguros (até 10 pessoas). Centraliza intake de demandas (de projetos, solicitações internas ou
externas), priorização, planejamento semanal por capacidade, execução via fluxo de trabalho
configurável e dashboards de performance. Inspirado no Ekyte, mas sem os conceitos de
multi-tenant/agência (ver [docs/PRD.md](docs/PRD.md) e
[docs/reference/ekyte/00-ANALISE-RESUMO.md](docs/reference/ekyte/00-ANALISE-RESUMO.md)).

## Stack Tecnológica

- Frontend: Next.js 16 (App Router) + React 19 + TypeScript 5
- UI: Tailwind CSS + shadcn/ui
- Backend/API: Next.js API Routes + Server Actions
- Banco de dados + Auth: Supabase (PostgreSQL + Row Level Security + Auth)
- Deploy: Vercel
- Versionamento: Git + GitHub
- Sem Stripe/pagamento — sistema interno, sem faturamento.

## Convenções de código

- TypeScript estrito; evitar `any` — tipar dados do Supabase com types gerados.
- Server Components por padrão; `"use client"` só onde há interatividade real.
- Mutações simples via Server Actions; API Routes só para webhooks/integrações externas.
- Validação com Zod em toda fronteira do sistema (formulários, Server Actions, webhooks).
- Nomenclatura: PascalCase (componentes), camelCase (funções/variáveis), kebab-case (pastas/rotas).
- Estilização só via Tailwind + shadcn/ui — sem CSS solto ou inline styles.
- RLS do Supabase protege por **usuário autenticado da Kev** (não há multi-tenant/workspace
  isolado por cliente — todo o time enxerga os mesmos dados, segmentados por campos/tags, não
  por container de permissão).
- Campos travados após criação da tarefa: `tipo` e `fluxo` não são editáveis depois de criados
  (só a `etapa` muda, via transição formal) — regra herdada do modelo Ekyte.
- Next.js 16: `params`/`searchParams` são assíncronos (`await`), arquivo de guard de rota é
  `proxy.ts` (não `middleware.ts`), Turbopack é o bundler padrão — ver `AGENTS.md`/
  `node_modules/next/dist/docs/` antes de usar padrões de versões anteriores.
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`).

## Identidade visual

- Cores da marca Kev extraídas de `Identidade visual Kev/Apresentação Institucional/`: verde-limão
  `#CFF74A` (accent, uso comedido — ação primária, item ativo, destaque), preto/branco/cinza como
  base neutra. Tema aprovado com direção "moderna, estilo Apple": fundo `#F5F5F7` (claro) /
  `#000000` (escuro), superfícies brancas/`#1C1C1E`, texto `#1D1D1F`/`#F5F5F7`, cantos generosos
  (12–20px), sombra discreta, sem preto puro no texto.
- Tipografia: fonte de sistema (`-apple-system`, San Francisco no Mac) — a fonte oficial da marca
  (PP Mori) tem licença "free for personal use" que não cobre uso no sistema; revisitar se a Kev
  obtiver licença comercial.
- Logo oficial em `Identidade visual Kev/Logo/` (`.ai`/`.eps` + PNGs) — usar os arquivos vetoriais
  reais na implementação, não recriar o ícone à mão.

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

## Metodologia de trabalho

- UI-first com dados mock, depois backend real (Supabase) — ver `docs/PLAN.md`.
- Um milestone por branch (`feat/NN-nome-do-milestone`), commits em Conventional Commits.
- Nunca commitar, dar push, abrir PR, mergear ou apagar branch sem pedido explícito do usuário.
- Antes de commitar mudanças não triviais, rodar `/code-review` (low/medium para mudanças
  pequenas, high/xhigh para mudanças grandes).
- `tsc --noEmit`, `eslint` e `next build` limpos antes de considerar algo pronto.

## Estrutura de pastas

```
.
├── .claude/                    # agentes e skills do Claude Code
├── docs/
│   ├── PRD.md
│   ├── PLAN.md
│   └── reference/ekyte/        # análise do Ekyte usada de referência
├── Identidade visual Kev/      # apresentação institucional, logos, fontes da marca
├── novo projeto/               # playbook de setup (NOVO-PROJETO.md) + docs do Ekyte
├── public/
├── src/
│   └── app/                    # App Router (Next.js 16)
├── AGENTS.md                   # guia de agente do Next.js (auto-gerado, importado no topo deste arquivo)
├── next.config.ts
├── package.json
└── tsconfig.json
```
