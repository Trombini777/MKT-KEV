-- Notificações in-app, genéricas por `tipo` (por enquanto só 'mencao_comentario', gerada ao
-- @mencionar alguém num comentário — ver comentario_mencoes em 0018). Dado pessoal do
-- destinatário, então a policy é restrita ao dono, no mesmo padrão de kev_mensagens/kev_memoria
-- (0010), não ao time inteiro como o resto do schema.

create table if not exists notificacoes (
  id uuid primary key default gen_random_uuid(),
  colaborador_id uuid not null references colaboradores(id) on delete cascade,
  tipo text not null,
  tarefa_id uuid references tarefas(id) on delete cascade,
  mensagem text not null,
  lida boolean not null default false,
  criado_em timestamptz not null default now()
);

create index if not exists idx_notificacoes_colaborador on notificacoes (colaborador_id, criado_em desc);

alter table notificacoes enable row level security;

create policy "notificacoes_dono" on notificacoes for all
  using (colaborador_id = (select id from colaboradores where auth_user_id = auth.uid()))
  with check (colaborador_id = (select id from colaboradores where auth_user_id = auth.uid()));
