-- Bloco de notas pessoal no menu lateral: uma anotação de texto livre por colaborador, pra
-- guardar lembretes ao longo do dia. Privada — mesma policy restrita ao dono da linha que
-- kev_mensagens/kev_memoria (ver 0010): ninguém do time enxerga a nota de outra pessoa.
create table if not exists notas_pessoais (
  colaborador_id uuid primary key references colaboradores(id) on delete cascade,
  conteudo text not null default '',
  cor text not null default 'verde' check (cor in ('verde', 'branco')),
  atualizado_em timestamptz not null default now()
);

alter table notas_pessoais enable row level security;

create policy "notas_pessoais_dono" on notas_pessoais for all
  using (colaborador_id = (select id from colaboradores where auth_user_id = auth.uid()))
  with check (colaborador_id = (select id from colaboradores where auth_user_id = auth.uid()));
