-- keV: assistente pessoal de trabalho. Diferente do resto do schema (onde qualquer colaborador
-- Kev enxerga tudo via `is_kev_colaborador()`), a conversa e a memória do keV são privadas por
-- pessoa — ninguém do time deve ler o histórico de chat ou as notas de memória de outro
-- colaborador, por isso a policy aqui é restrita ao dono da linha, não ao time inteiro.

create table if not exists kev_mensagens (
  id uuid primary key default gen_random_uuid(),
  colaborador_id uuid not null references colaboradores(id) on delete cascade,
  papel text not null check (papel in ('user', 'assistant')),
  conteudo text not null,
  criado_em timestamptz not null default now()
);

create index if not exists idx_kev_mensagens_colaborador on kev_mensagens (colaborador_id, criado_em);

-- Memória simples: uma nota de texto por colaborador, atualizada de forma cumulativa pela
-- própria IA (tool `salvarNota`) quando identifica algo que vale lembrar entre conversas.
create table if not exists kev_memoria (
  colaborador_id uuid primary key references colaboradores(id) on delete cascade,
  notas text not null default '',
  atualizado_em timestamptz not null default now()
);

alter table kev_mensagens enable row level security;
alter table kev_memoria enable row level security;

create policy "kev_mensagens_dono" on kev_mensagens for all
  using (colaborador_id = (select id from colaboradores where auth_user_id = auth.uid()))
  with check (colaborador_id = (select id from colaboradores where auth_user_id = auth.uid()));

create policy "kev_memoria_dono" on kev_memoria for all
  using (colaborador_id = (select id from colaboradores where auth_user_id = auth.uid()))
  with check (colaborador_id = (select id from colaboradores where auth_user_id = auth.uid()));
