-- Dedup do convite proativo do keV ao abrir uma atividade (ver src/lib/kev-tarefa.ts): garante
-- que a pessoa só veja o convite uma vez por etapa de uma tarefa, mesmo abrindo/fechando o
-- detalhe várias vezes ou trocando de aba/dispositivo. Mesma policy restrita ao dono da linha
-- que kev_mensagens/kev_memoria (ver 0010_kev_assistente.sql) — não é dado do time, é estado de
-- interação pessoal com o keV.

create table if not exists kev_convites_atividade (
  id uuid primary key default gen_random_uuid(),
  colaborador_id uuid not null references colaboradores(id) on delete cascade,
  tarefa_id uuid not null references tarefas(id) on delete cascade,
  -- id da linha planejamento_etapas quando a tarefa tem planejamento aplicado; senão, fase_atual_id
  -- (fallback pra tarefas sem planejamento) — ver etapaAtualDe em src/lib/tarefa-etapa.ts.
  etapa_ref text not null,
  criado_em timestamptz not null default now(),
  unique (colaborador_id, tarefa_id, etapa_ref)
);

alter table kev_convites_atividade enable row level security;

create policy "kev_convites_atividade_dono" on kev_convites_atividade for all
  using (colaborador_id = (select id from colaboradores where auth_user_id = auth.uid()))
  with check (colaborador_id = (select id from colaboradores where auth_user_id = auth.uid()));
