-- Sugestões de melhoria para o SISTEMA de gestão de marketing (não sobre o keV — isso já é
-- coberto por kev_feedback_treinamento). O keV coleta espontaneamente quando alguém menciona um
-- problema, fricção ou ideia de melhoria da plataforma, pra revisão do responsável do projeto.
-- Mesma policy de leitura do time inteiro que kev_feedback_treinamento.

create table if not exists kev_sugestoes_sistema (
  id uuid primary key default gen_random_uuid(),
  colaborador_id uuid not null references colaboradores(id) on delete cascade,
  conteudo text not null,
  criado_em timestamptz not null default now()
);

create index if not exists idx_kev_sugestoes_sistema_criado_em on kev_sugestoes_sistema (criado_em);

alter table kev_sugestoes_sistema enable row level security;

create policy "kev_sugestoes_sistema_time" on kev_sugestoes_sistema for all
  using (is_kev_colaborador())
  with check (is_kev_colaborador());
