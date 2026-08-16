-- Toda tarefa nasce em Solicitações (Aprovação) -> Triagem antes de ganhar um tipo/planejamento
-- — hoje essas duas etapas universais não têm dono nenhum, então ficam "sem ninguém responsável"
-- até alguém lembrar de atribuir manualmente. Esta migração adiciona uma configuração global (1
-- responsável padrão pra Aprovação, 1 pra Triagem) e passa a atribuir automaticamente:
-- `criar_solicitacao_publica` atribui o padrão de Aprovação já na criação; `criar_atividade_interna`
-- (que pula direto pra Triagem) e a aprovação manual (client, ver registrarAprovacaoInterna)
-- atribuem o padrão de Triagem no momento em que a tarefa chega lá.

-- Idempotente: essa migração já falhou no meio uma vez (função ambígua, ver abaixo), então pode
-- ser executada de novo com a tabela já existindo de uma tentativa anterior.
create table if not exists configuracoes_fluxo (
  id boolean primary key default true check (id),
  responsavel_padrao_aprovacao_id uuid references colaboradores(id) on delete set null,
  responsavel_padrao_triagem_id uuid references colaboradores(id) on delete set null
);

insert into configuracoes_fluxo (id) values (true) on conflict (id) do nothing;

alter table configuracoes_fluxo enable row level security;
drop policy if exists "kev_colaborador_all" on configuracoes_fluxo;
create policy "kev_colaborador_all" on configuracoes_fluxo
  for all using (is_kev_colaborador()) with check (is_kev_colaborador());

-- Se a migração 0002 nunca chegou a rodar, ainda existe a versão original (0001) com a ordem de
-- parâmetros antiga (`p_solicitante_email` antes de `p_prioridade_sugerida`, sem default) —
-- `create or replace` não bate com essa assinatura e criaria uma segunda function ambígua em vez
-- de substituir. Derruba a versão antiga explicitamente antes de recriar (idempotente: não faz
-- nada se ela já não existir mais).
drop function if exists criar_solicitacao_publica(
  text, text, text, text, prioridade_sugerida, text, text, date, text, text, text[]
);

create or replace function criar_solicitacao_publica(
  p_titulo text,
  p_descricao text,
  p_departamento text,
  p_prioridade_sugerida prioridade_sugerida,
  p_solicitante_email text default null,
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
  v_responsavel_aprovacao uuid;
  v_executores jsonb := '{}'::jsonb;
begin
  select responsavel_padrao_aprovacao_id into v_responsavel_aprovacao
  from configuracoes_fluxo where id = true;

  if v_responsavel_aprovacao is not null then
    v_executores := jsonb_build_object('solicitacoes', jsonb_build_array(v_responsavel_aprovacao));
  end if;

  insert into tarefas (
    titulo, descricao, origem, departamento, solicitante_nome, solicitante_email,
    prioridade_sugerida, justificativa_prioridade, prazo, justificativa_prazo, observacoes,
    anexos, fase_atual_id, prioridade_final, data_inicio, executores_por_fase
  ) values (
    p_titulo, p_descricao, 'Solicitação', p_departamento, p_solicitante_nome, p_solicitante_email,
    p_prioridade_sugerida, p_justificativa_prioridade, p_prazo, p_justificativa_prazo, p_observacoes,
    coalesce(p_anexos, '{}'), 'solicitacoes', 'Normal', current_date, v_executores
  )
  returning id into v_id;

  insert into historico_eventos (tarefa_id, descricao, fase_id)
  values (v_id, 'Solicitação registrada', 'solicitacoes');

  return v_id;
end;
$$;

grant execute on function criar_solicitacao_publica to anon, authenticated;

-- Mesma assinatura de antes (0003).
create or replace function criar_atividade_interna(
  p_titulo text,
  p_descricao text,
  p_departamento text,
  p_prioridade_sugerida prioridade_sugerida,
  p_solicitante_nome text default null,
  p_solicitante_email text default null,
  p_prazo date default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
  v_autor_id uuid;
  v_autor_nome text;
  v_responsavel_triagem uuid;
  v_executores jsonb := '{}'::jsonb;
begin
  select id, nome into v_autor_id, v_autor_nome
  from colaboradores
  where auth_user_id = auth.uid();

  select responsavel_padrao_triagem_id into v_responsavel_triagem
  from configuracoes_fluxo where id = true;

  if v_responsavel_triagem is not null then
    v_executores := jsonb_build_object('triagem', jsonb_build_array(v_responsavel_triagem));
  end if;

  insert into tarefas (
    titulo, descricao, origem, departamento, solicitante_nome, solicitante_email,
    prioridade_sugerida, fase_atual_id, prioridade_final, data_inicio, prazo, executores_por_fase
  ) values (
    p_titulo, p_descricao, 'Solicitação', p_departamento, p_solicitante_nome, p_solicitante_email,
    p_prioridade_sugerida, 'triagem', 'Normal', current_date, p_prazo, v_executores
  )
  returning id into v_id;

  insert into historico_eventos (tarefa_id, autor_id, descricao, fase_id)
  values (v_id, v_autor_id, 'Solicitação registrada', 'solicitacoes');

  insert into historico_eventos (tarefa_id, autor_id, descricao, fase_id, acao)
  values (
    v_id, v_autor_id,
    coalesce(v_autor_nome, 'Alguém') || ' aprovou a solicitação da atividade "' || p_titulo || '"',
    'solicitacoes', 'aprovada'
  );

  insert into historico_eventos (tarefa_id, autor_id, descricao, fase_id)
  values (v_id, v_autor_id, 'Movida para Triagem', 'triagem');

  return v_id;
end;
$$;

grant execute on function criar_atividade_interna to authenticated;
