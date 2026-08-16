-- `criar_solicitacao_publica` + `registrarAprovacaoInterna` (client) faziam a criação interna em
-- ~6 idas sequenciais ao banco (insert, recarregar lista inteira, aprovar, mover fase, 2x
-- histórico) — rápido em dev local, mas frágil/lento o bastante em rede real pra parecer que
-- "não funcionou" (ver relato do usuário). Esta function faz tudo isso de uma vez só, no
-- servidor, numa única chamada RPC: cria a tarefa já em Triagem (pula Solicitações), com os 3
-- eventos de histórico que o fluxo manual geraria (registrada, aprovada, movida).
--
-- Diferente de `criar_solicitacao_publica` (chamável por `anon`, pro formulário público), esta é
-- só pra quem já está autenticado como colaborador Kev — por isso não é `security definer` e
-- depende de RLS normal (`is_kev_colaborador()`) pra proteger o insert.
create function criar_atividade_interna(
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
begin
  select id, nome into v_autor_id, v_autor_nome
  from colaboradores
  where auth_user_id = auth.uid();

  insert into tarefas (
    titulo, descricao, origem, departamento, solicitante_nome, solicitante_email,
    prioridade_sugerida, fase_atual_id, prioridade_final, data_inicio, prazo
  ) values (
    p_titulo, p_descricao, 'Solicitação', p_departamento, p_solicitante_nome, p_solicitante_email,
    p_prioridade_sugerida, 'triagem', 'Normal', current_date, p_prazo
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
