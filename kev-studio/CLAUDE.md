# KEV Studio

## Visão geral

Portal de autoatendimento com IA para as áreas de negócio (BUs) da KEV Seguros. O colaborador
descreve o material de que precisa e agentes treinados na identidade visual KEV produzem
apresentações, artes e textos ou ajustes de documentos em minutos. Campanhas, vídeos e peças
de maior complexidade ou impacto são encaminhados ao time de Marketing, que os recebe no
Sistema de Gestão de Marketing com briefing estruturado. Detalhes em [docs/PRD.md](docs/PRD.md)
e no pitch [KEV_Studio_Pitch .html](KEV_Studio_Pitch%20.html).

## Stack Tecnológica

- Frontend: Next.js 16 (App Router) + React 19 + TypeScript 5
- UI: Tailwind CSS 4 + shadcn/ui (estilo `base-nova`, ícones lucide)
- Backend/API: Next.js API Routes + Server Actions
- Banco de dados + Auth + Storage: Supabase (PostgreSQL + Row Level Security + Auth + Storage),
  **o mesmo projeto do Sistema de Marketing**, com tabelas adicionais prefixadas `studio_`.
  As migrations ficam em `../supabase/migrations/` (fonte única do schema), nunca em uma
  pasta própria do Studio
- Repositório: o mesmo do Sistema de Marketing (`Trombini777/MKT-KEV`); o Studio é um segundo
  app Next.js nesta pasta, com deploy em projeto Vercel próprio (Root Directory desta pasta)
- IA de texto e roteamento: Claude API via AI SDK (`ai` + `@ai-sdk/anthropic`)
- Imagens: Higgsfield (API), com composição final via `next/og`
- Arquivos de saída: PptxGenJS (.pptx), `docx` + mammoth (.docx)
- E-mail transacional: Resend
- Deploy: Vercel, domínio `studio.kevseguros.com.br`
- Versionamento: Git + GitHub
- Sem Stripe/pagamento: sistema interno, sem faturamento.

## Convenções de código

- TypeScript estrito; evitar `any`. Tipar dados do Supabase com types gerados.
- Server Components por padrão; `"use client"` só onde há interatividade real.
- Mutações simples via Server Actions; API Routes só para integrações externas (Sistema de
  Marketing, Higgsfield, webhooks).
- Validação com Zod em toda fronteira do sistema (formulários, Server Actions, integrações) e
  em **toda saída de agente de IA**.
- Nomenclatura: PascalCase (componentes), camelCase (funções/variáveis), kebab-case
  (pastas/rotas).
- Estilização só via Tailwind + shadcn/ui. Sem CSS solto ou inline styles.
- RLS do Supabase protege por **usuário e área**: o colaborador vê só os próprios pedidos, o
  gestor de área vê os da sua área, o time de Marketing (`is_kev_colaborador()`) vê tudo.
  Nunca filtrar área só no client ou em query manual.
- Banco compartilhado: toda tabela, função, policy e bucket novo do Studio leva o prefixo
  `studio_`. Usuários de BU vivem em `studio_usuarios`, nunca em `colaboradores`. Qualquer
  alteração em tabela existente do Sistema de Marketing exige revisão e teste de RLS dos dois
  perfis. O Studio escreve em `tarefas` só pela função `studio_encaminhar_pedido()`.
- Branches: `feat/studio-NN-nome`, para não colidir com as do Sistema de Marketing.
- **A IA nunca desenha a marca.** Agentes devolvem conteúdo e estrutura (JSON validado por Zod).
  Layout, cores, logo e tipografia vêm sempre dos templates KEV codificados no projeto.
- Toda chamada a modelo de IA ou ao Higgsfield registra consumo (tokens, créditos, custo
  estimado) por usuário e área, e respeita a cota da área antes de executar.
- Next.js 16: `params`/`searchParams` são assíncronos (`await`), o guard de rota é `proxy.ts`
  (não `middleware.ts`), Turbopack é o bundler padrão. Consultar `node_modules/next/dist/docs/`
  antes de usar padrões de versões anteriores.
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`).

## Identidade visual

Mesmo tema aprovado no Sistema de Gestão de Marketing, para que os dois sistemas pareçam um só
produto KEV:

- Verde-limão `#CFF74A` como accent (uso comedido: ação primária, item ativo, destaque).
- Direção "moderna, estilo Apple": fundo `#F5F5F7` (claro) / `#000000` (escuro), superfícies
  `#FFFFFF` / `#1C1C1E`, texto `#1D1D1F` / `#F5F5F7`, bordas `#D2D2D7` / `#38383A`,
  `--radius: 0.75rem`, sombra discreta. Tokens completos copiados de
  `../src/app/globals.css`.
- Tipografia: Geist e Geist Mono via `next/font/google`, as mesmas do Sistema de Marketing. A
  fonte da marca (PP Mori) tem licença "free for personal use" e não cobre uso no sistema nem
  nos arquivos gerados.
- Logo e favicon: os mesmos do Sistema de Marketing (`kev-logo.tsx`, `kev-mark.tsx` e
  `src/app/icon.png`), com o selo "Studio" ao lado da logo. Nunca recriar o ícone à mão.
- Telas de referência: telas conceituais dos slides 02, 04 e 07 do pitch.

## Workflow de Git, deploy e segurança

Sempre que for fazer `git push` ou concluir um milestone:

1. **Antes de subir (pre-push):**
   - Conferir `git status` / `git diff --staged` pra ver exatamente o que vai subir.
   - Garantir que `.env`, `.env.local`, `.env*.local`, `.vercel/` e
     `.claude/settings.local.json` estão no `.gitignore` e não aparecem staged/tracked.
   - Buscar padrões de segredo no que vai ser commitado (`sk-ant-`, `sk_live_`, `sk_test_`,
     `whsec_`, `AKIA...`, JWT, connection strings, `service_role`, chave do Higgsfield, senha em
     texto plano).
2. **Depois de subir (post-push):**
   - `git log --all -p | grep -inE "<padrões>"` no histórico completo, não só no último commit.
   - Comparar `git rev-parse <branch> origin/<branch>` pra confirmar que o que subiu bate
     com o que foi revisado localmente.
3. **Relatório de milestone:** ao finalizar, sempre apresentar o que foi feito e como foi a
   checagem de segurança (pre e post-push).

## Metodologia de trabalho

- Seguir o playbook `../novo projeto/NOVO-PROJETO.md`.
- UI-first com dados mock, depois backend real. Ver [docs/PLAN.md](docs/PLAN.md).
- Um milestone por branch (`feat/NN-nome-do-milestone`), commits em Conventional Commits.
- Nunca commitar, dar push, abrir PR, mergear ou apagar branch sem pedido explícito do usuário.
- Antes de commitar mudanças não triviais, rodar `/code-review` (low/medium para mudanças
  pequenas, high/xhigh para mudanças grandes).
- `tsc --noEmit`, `eslint` e `next build` limpos antes de considerar algo pronto.
- Nunca pedir chave ou segredo no chat. O usuário edita o `.env.local` direto; a existência da
  variável é conferida por script, sem imprimir o valor.

## Estrutura de pastas

```
kev-studio/                    # app do Studio, dentro do repositório MKT-KEV
├── .claude/                   # agentes e skills de desenvolvimento (playbook §1.1)
├── docs/
│   ├── PRD.md
│   └── PLAN.md
├── src/
│   ├── app/                   # App Router (Next.js 16): layout, página inicial, favicon
│   ├── components/            # logo KEV, StudioLogo, tema e primitivos shadcn em ui/
│   └── lib/
│       ├── env.ts             # variáveis de ambiente validadas com Zod
│       └── supabase/          # clientes (browser, server, service role) e status
├── .env.example
├── KEV_Studio_Pitch .html     # pitch aprovado do projeto
└── package.json               # dev na porta 3001
../supabase/migrations/        # schema compartilhado com o Sistema de Marketing
```
