-- Bucket de fotos de perfil da equipe (upload na criação/edição de colaborador). Já foi criado
-- via API nesta sessão (POST /storage/v1/bucket com a service_role key — REST não faz DDL, então
-- bucket dá pra criar assim, mas RLS de storage.objects só via SQL Editor mesmo); esse insert
-- fica aqui só pra manter o histórico do schema reproduzível.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 3145728, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

-- Leitura é pública (bucket public=true já serve os arquivos sem RLS), mas escrita fica restrita
-- a colaborador Kev autenticado — mesma regra binária do resto do app (is_kev_colaborador(),
-- ver 0001_init_schema.sql).
create policy "leitura_publica_avatars" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "kev_colaborador_upload_avatars" on storage.objects
  for insert with check (bucket_id = 'avatars' and is_kev_colaborador());

create policy "kev_colaborador_atualiza_avatars" on storage.objects
  for update using (bucket_id = 'avatars' and is_kev_colaborador())
  with check (bucket_id = 'avatars' and is_kev_colaborador());

create policy "kev_colaborador_remove_avatars" on storage.objects
  for delete using (bucket_id = 'avatars' and is_kev_colaborador());
