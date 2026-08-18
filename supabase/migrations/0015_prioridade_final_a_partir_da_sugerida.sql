-- Bug: `criar_solicitacao_publica` e `criar_atividade_interna` (0004) gravam `prioridade_final`
-- como o literal fixo 'Normal' na criação, ignorando a prioridade sugerida (`p_prioridade_sugerida`)
-- que a pessoa de fato escolheu — e não existe NENHUM lugar no app que edite `prioridade_final`
-- depois disso (não há ainda uma etapa de triagem que reavalie a prioridade). Resultado: toda
-- tarefa nasce e permanece pra sempre com o badge "Média" (Normal), mesmo quando foi pedida como
-- Alta/Crítica. Esta migração faz `prioridade_final` nascer igual à sugerida (mapeando o enum
-- `prioridade_sugerida`, que não tem "Crítica", pro `prioridade_final` equivalente) e corrige
-- retroativamente as tarefas já criadas com esse bug.

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
  v_prioridade_final prioridade_final := case p_prioridade_sugerida
    when 'Alta' then 'Alta'::prioridade_final
    when 'Baixa' then 'Baixa'::prioridade_final
    else 'Normal'::prioridade_final
  end;
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
    coalesce(p_anexos, '{}'), 'solicitacoes', v_prioridade_final, current_date, v_executores
  )
  returning id into v_id;

  insert into historico_eventos (tarefa_id, descricao, fase_id)
  values (v_id, 'Solicitação registrada', 'solicitacoes');

  return v_id;
end;
$$;

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
  v_prioridade_final prioridade_final := case p_prioridade_sugerida
    when 'Alta' then 'Alta'::prioridade_final
    when 'Baixa' then 'Baixa'::prioridade_final
    else 'Normal'::prioridade_final
  end;
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
    p_prioridade_sugerida, 'triagem', v_prioridade_final, current_date, p_prazo, v_executores
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

-- Backfill: só existem 2 caminhos de criação de tarefa no sistema (as duas functions acima), e
-- nenhum outro lugar grava em `prioridade_final` depois — então toda linha com prioridade_final =
-- 'Normal' está assim só por causa do bug, nunca por uma escolha manual (essa escolha não existe
-- ainda). Seguro corrigir todas de uma vez a partir da sugerida real.
update tarefas set prioridade_final = case prioridade_sugerida
  when 'Alta' then 'Alta'::prioridade_final
  when 'Baixa' then 'Baixa'::prioridade_final
  else 'Normal'::prioridade_final
end
where prioridade_final = 'Normal' and prioridade_sugerida is not null;
