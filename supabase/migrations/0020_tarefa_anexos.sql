-- Upload de arquivo de verdade nas tarefas. Antes disso, `tarefas.anexos` só guardava o NOME
-- digitado (ver comentário em task-store.ts) — sem bytes em lugar nenhum, então não tinha como
-- abrir/baixar depois. `tarefas.anexos` continua existindo pros registros antigos (só texto,
-- sem arquivo real por trás — ficam listados mas não clicáveis), e essa tabela nova passa a
-- guardar os anexos enviados de fato.
--
-- Bucket `anexos` já foi criado via API nesta sessão (POST /storage/v1/bucket, mesmo motivo do
-- bucket `avatars` em 0008_storage_avatars.sql — REST não faz DDL, então bucket não é algo pra
-- criar por aqui); privado (public=false), 25MB de limite por arquivo. Esse insert é só pra manter
-- o histórico do schema reproduzível.
insert into storage.buckets (id, name, public, file_size_limit)
values ('anexos', 'anexos', false, 26214400)
on conflict (id) do nothing;

create table if not exists tarefa_anexos (
  id uuid primary key default gen_random_uuid(),
  tarefa_id uuid not null references tarefas(id) on delete cascade,
  autor_id uuid references colaboradores(id) on delete set null,
  nome_original text not null,
  caminho_storage text not null,
  criado_em timestamptz not null default now()
);

create index if not exists idx_tarefa_anexos_tarefa_id on tarefa_anexos (tarefa_id);

alter table tarefa_anexos enable row level security;

create policy "tarefa_anexos_time" on tarefa_anexos for all
  using (is_kev_colaborador())
  with check (is_kev_colaborador());

-- Bucket privado (sem leitura pública como `avatars`): só colaborador Kev autenticado lê/escreve,
-- e só via URL assinada (ver `obterUrlAnexo` em task-store.ts) — nunca por link direto/público.
create policy "kev_colaborador_le_anexos" on storage.objects
  for select using (bucket_id = 'anexos' and is_kev_colaborador());

create policy "kev_colaborador_upload_anexos" on storage.objects
  for insert with check (bucket_id = 'anexos' and is_kev_colaborador());

create policy "kev_colaborador_remove_anexos" on storage.objects
  for delete using (bucket_id = 'anexos' and is_kev_colaborador());
