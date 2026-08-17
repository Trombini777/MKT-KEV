-- keV em fase de treinamento: registro de feedback sobre a qualidade das respostas (fez sentido
-- ou não, como a pessoa prefere que uma atividade/análise seja detalhada) pra revisão semanal do
-- time. Diferente de `kev_memoria` (privada, adapta o keV pra aquela pessoa na hora), essa tabela
-- é de leitura do time inteiro — por isso a policy padrão `is_kev_colaborador()`, igual ao resto
-- do schema, em vez da policy restrita ao dono usada em kev_mensagens/kev_memoria.

create table if not exists kev_feedback_treinamento (
  id uuid primary key default gen_random_uuid(),
  colaborador_id uuid not null references colaboradores(id) on delete cascade,
  conteudo text not null,
  criado_em timestamptz not null default now()
);

create index if not exists idx_kev_feedback_treinamento_criado_em on kev_feedback_treinamento (criado_em);

alter table kev_feedback_treinamento enable row level security;

create policy "kev_feedback_treinamento_time" on kev_feedback_treinamento for all
  using (is_kev_colaborador())
  with check (is_kev_colaborador());
