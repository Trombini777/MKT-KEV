-- Sistema Kev Marketing — schema inicial (M0 Auth + M2 schema/CRUD)
-- Rodar este arquivo inteiro no SQL Editor do Supabase (Database > SQL Editor) ANTES do seed.sql.

create extension if not exists pgcrypto;

-- =========================================================================
-- ENUMS
-- =========================================================================

create type categoria_etapa as enum ('Backlog', 'Em Execução', 'Em Aprovação', 'Concluído');
create type status_colaborador as enum ('Ativo', 'Em Licença', 'Inativo');
create type modo_execucao as enum ('Individual', 'Coletiva');
create type origem_tarefa as enum ('Projeto', 'Solicitação');
create type prioridade_sugerida as enum ('Alta', 'Regular', 'Baixa');
create type prioridade_final as enum ('Crítica', 'Alta', 'Normal', 'Baixa');
create type tipo_solicitacao_geral as enum ('Tarefa', 'Projeto', 'Campanha');
create type status_planejamento as enum ('sem-prazo', 'dentro-do-prazo', 'apertado', 'impossivel');
create type perfil_usuario as enum ('Admin', 'Editor', 'Viewer');
create type tipo_projeto as enum ('Projeto', 'Campanha');
create type acao_aprovacao as enum ('aprovada', 'recusada');
create type resposta_sim_nao as enum ('sim', 'nao');

-- =========================================================================
-- TABELAS — catálogos com PK text (slugs já hardcoded no front-end)
-- =========================================================================

create table fases (
  id text primary key,
  nome text not null,
  ordem int not null,
  sla_dias int not null default 0,
  is_final boolean not null default false,
  modo_execucao modo_execucao not null default 'Individual'
);

create table transicoes (
  de text not null references fases(id) on delete cascade,
  para text not null references fases(id) on delete cascade,
  label text,
  primary key (de, para)
);

-- id = o próprio nome (lista fechada e curada, sem tela de gestão — ver docs/PRD.md E1).
create table departamentos (
  id text primary key,
  nome text not null
);

-- =========================================================================
-- TABELAS — catálogos com PK uuid
-- =========================================================================

create table squads (
  id uuid primary key default gen_random_uuid(),
  nome text not null
);

create table colaboradores (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  nome text not null,
  email text not null unique,
  whatsapp text,
  data_nascimento date,
  cargo text not null,
  skills text[] not null default '{}',
  capacidade_horas_semana numeric not null default 40,
  status status_colaborador not null default 'Ativo',
  squad_id uuid references squads(id) on delete set null,
  avatar_iniciais text not null,
  avatar_url text,
  perfil perfil_usuario not null default 'Editor'
);

create table unidades_medida (
  id uuid primary key default gen_random_uuid(),
  nome text not null
);

-- Catálogo reutilizável de etapas (aba "Etapas") — building blocks do fluxo de cada Tipo de Tarefa.
create table etapas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria categoria_etapa not null
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique
);

create table tipos_tarefa (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text not null default '',
  ativo boolean not null default true,
  unidade_medida_id uuid references unidades_medida(id) on delete set null,
  atualizado_em date not null default current_date
);

-- Uso de uma etapa dentro do fluxo de um Tipo de Tarefa específico.
create table tipos_tarefa_etapas (
  id uuid primary key default gen_random_uuid(),
  tipo_tarefa_id uuid not null references tipos_tarefa(id) on delete cascade,
  etapa_id uuid not null references etapas(id) on delete restrict,
  ordem int not null,
  estimativa_horas numeric,
  executor_padrao_id uuid references colaboradores(id) on delete set null,
  -- ordens de outras tipos_tarefa_etapas do MESMO tipo que precisam terminar antes (não FK —
  -- referencia a coluna `ordem` de linhas irmãs, igual ao campo EtapaDoTipo.dependeDe atual).
  depende_de int[] not null default '{}',
  pode_dividir boolean not null default false,
  sla_dias numeric,
  executores_permitidos_ids uuid[] not null default '{}',
  unique (tipo_tarefa_id, ordem)
);

-- Substitui o antigo mapa plano `${tipoId}:${faseId} -> colaboradorId`.
create table tipos_tarefa_executores_padrao (
  tipo_tarefa_id uuid not null references tipos_tarefa(id) on delete cascade,
  fase_id text not null references fases(id) on delete cascade,
  colaborador_id uuid not null references colaboradores(id) on delete cascade,
  primary key (tipo_tarefa_id, fase_id)
);

create table projetos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  sigla text not null,
  descricao text not null default '',
  tipo tipo_projeto not null,
  departamento text references departamentos(id),
  responsavel_id uuid references colaboradores(id) on delete set null,
  data_inicio date,
  data_fim date,
  notas_encerramento text
);

-- =========================================================================
-- TAREFAS e entidades filhas
-- =========================================================================

create table tarefas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text not null default '',
  tipo_id uuid references tipos_tarefa(id) on delete set null,
  origem origem_tarefa not null,
  solicitante_nome text,
  solicitante_email text,
  anexos text[] not null default '{}',
  links text[] not null default '{}',
  justificativa_prioridade text,
  justificativa_prazo text,
  observacoes text,
  quantidade_unidade numeric,
  dados_completos resposta_sim_nao,
  tipo_solicitacao_geral tipo_solicitacao_geral,
  departamento text references departamentos(id),
  projeto_id uuid references projetos(id) on delete set null,
  prioridade_sugerida prioridade_sugerida,
  prioridade_final prioridade_final not null default 'Normal',
  fase_atual_id text not null references fases(id),
  data_inicio date not null default current_date,
  prazo date,
  previsao_conclusao date,
  -- Record<faseId, colaboradorId[]> / Record<faseId, horas> — jsonb: o front já indexa esses
  -- campos por faseId em JS, troca direta sem precisar normalizar em tabela filha.
  executores_por_fase jsonb not null default '{}',
  estimativa_por_fase jsonb not null default '{}',
  participantes_ids uuid[] not null default '{}',
  tag_ids uuid[] not null default '{}',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index idx_tarefas_fase_atual on tarefas (fase_atual_id);
create index idx_tarefas_tipo on tarefas (tipo_id);
create index idx_tarefas_projeto on tarefas (projeto_id);

create table checklist_itens (
  id uuid primary key default gen_random_uuid(),
  tarefa_id uuid not null references tarefas(id) on delete cascade,
  texto text not null,
  feito boolean not null default false,
  criado_em timestamptz not null default now()
);
create index idx_checklist_tarefa on checklist_itens (tarefa_id);

create table comentarios (
  id uuid primary key default gen_random_uuid(),
  tarefa_id uuid not null references tarefas(id) on delete cascade,
  autor_id uuid references colaboradores(id) on delete set null,
  texto text not null,
  criado_em timestamptz not null default now()
);
create index idx_comentarios_tarefa on comentarios (tarefa_id);

create table historico_eventos (
  id uuid primary key default gen_random_uuid(),
  tarefa_id uuid not null references tarefas(id) on delete cascade,
  data timestamptz not null default now(),
  autor_id uuid references colaboradores(id) on delete set null,
  descricao text not null,
  fase_id text references fases(id),
  acao acao_aprovacao
);
create index idx_historico_tarefa on historico_eventos (tarefa_id);

-- 1:1 com tarefas — planejamento por etapa gerado pelo motor de regras e aplicado.
create table planejamentos (
  id uuid primary key default gen_random_uuid(),
  tarefa_id uuid not null unique references tarefas(id) on delete cascade,
  gerado_em timestamptz not null default now(),
  previsao_conclusao date not null,
  status status_planejamento not null,
  folga_dias int,
  etapa_atual_ordem int not null default 1
);

create table planejamento_etapas (
  id uuid primary key default gen_random_uuid(),
  planejamento_id uuid not null references planejamentos(id) on delete cascade,
  etapa_id uuid not null references etapas(id) on delete restrict,
  ordem int not null,
  colaborador_id uuid references colaboradores(id) on delete set null,
  data_fim date not null,
  unique (planejamento_id, ordem)
);
create index idx_planejamento_etapas_planejamento on planejamento_etapas (planejamento_id);

create table planejamento_alocacoes (
  id uuid primary key default gen_random_uuid(),
  planejamento_etapa_id uuid not null references planejamento_etapas(id) on delete cascade,
  data date not null,
  horas numeric not null
);
create index idx_planejamento_alocacoes_etapa on planejamento_alocacoes (planejamento_etapa_id);

-- =========================================================================
-- Trigger: atualizado_em em tarefas
-- =========================================================================

create or replace function set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger trg_tarefas_atualizado_em
before update on tarefas
for each row execute function set_atualizado_em();

-- =========================================================================
-- RLS — protege por usuário autenticado da Kev (sem multi-tenant, sem perfil
-- granular ainda — ver docs/PRD.md §8 e docs/PLAN.md M8).
-- =========================================================================

create or replace function is_kev_colaborador()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from colaboradores where auth_user_id = auth.uid()
  );
$$;

-- Tabelas de acesso binário: qualquer colaborador Kev autenticado lê/escreve tudo.
do $$
declare
  t text;
begin
  foreach t in array array[
    'squads', 'colaboradores', 'unidades_medida', 'etapas', 'tags',
    'tipos_tarefa', 'tipos_tarefa_etapas', 'tipos_tarefa_executores_padrao',
    'projetos', 'tarefas', 'checklist_itens', 'comentarios', 'historico_eventos',
    'planejamentos', 'planejamento_etapas', 'planejamento_alocacoes',
    'fases', 'transicoes'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy "kev_colaborador_all" on %I for all using (is_kev_colaborador()) with check (is_kev_colaborador())',
      t
    );
  end loop;
end $$;

-- departamentos: leitura pública (formulário de Solicitação sem login precisa do dropdown),
-- escrita só para colaborador Kev autenticado.
alter table departamentos enable row level security;
create policy "leitura_publica_departamentos" on departamentos for select using (true);
create policy "kev_colaborador_insere_departamentos" on departamentos for insert with check (is_kev_colaborador());
create policy "kev_colaborador_atualiza_departamentos" on departamentos for update using (is_kev_colaborador()) with check (is_kev_colaborador());
create policy "kev_colaborador_deleta_departamentos" on departamentos for delete using (is_kev_colaborador());

-- =========================================================================
-- RPC pública — único ponto de escrita liberado para `anon` (formulário de
-- Solicitação sem login). Insert-only, campos fixos, nunca expõe a tabela
-- `tarefas` inteira via RLS direta — ver docs/PRD.md §8 "Exceção ao RLS".
-- =========================================================================

create or replace function criar_solicitacao_publica(
  p_titulo text,
  p_descricao text,
  p_departamento text,
  p_solicitante_email text,
  p_prioridade_sugerida prioridade_sugerida,
  p_solicitante_nome text default null,
  p_justificativa_prioridade text default null,
  p_prazo date default null,
  p_justificativa_prazo text default null,
  p_observacoes text default null,
  p_anexos text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into tarefas (
    titulo, descricao, origem, departamento, solicitante_nome, solicitante_email,
    prioridade_sugerida, justificativa_prioridade, prazo, justificativa_prazo, observacoes,
    anexos, fase_atual_id, prioridade_final, data_inicio
  ) values (
    p_titulo, p_descricao, 'Solicitação', p_departamento, p_solicitante_nome, p_solicitante_email,
    p_prioridade_sugerida, p_justificativa_prioridade, p_prazo, p_justificativa_prazo, p_observacoes,
    coalesce(p_anexos, '{}'), 'solicitacoes', 'Normal', current_date
  )
  returning id into v_id;

  insert into historico_eventos (tarefa_id, descricao, fase_id)
  values (v_id, 'Solicitação recebida via formulário público', 'solicitacoes');

  return v_id;
end;
$$;

grant execute on function criar_solicitacao_publica to anon, authenticated;
