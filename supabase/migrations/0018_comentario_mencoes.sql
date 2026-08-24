-- Relação de quem foi @mencionado em cada comentário. Guardada separada do texto do comentário
-- (que continua puro, sem marcação) porque o keV usa `comentarios.texto` como contexto de IA
-- (ver `kev-tarefa.ts`) e marcação tipo `@[Nome](id)` embutida no texto poluiria esse contexto.
-- Mesma policy de leitura do time inteiro que o resto do schema principal.

create table if not exists comentario_mencoes (
  id uuid primary key default gen_random_uuid(),
  comentario_id uuid not null references comentarios(id) on delete cascade,
  colaborador_id uuid not null references colaboradores(id) on delete cascade,
  criado_em timestamptz not null default now()
);

create index if not exists idx_comentario_mencoes_comentario_id on comentario_mencoes (comentario_id);

alter table comentario_mencoes enable row level security;

create policy "comentario_mencoes_time" on comentario_mencoes for all
  using (is_kev_colaborador())
  with check (is_kev_colaborador());
