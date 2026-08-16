-- Ajustes na function `criar_solicitacao_publica`: passa a ser usada também pelo dialog "Nova
-- atividade" dentro do sistema (autenticado), não só pelo formulário público — então o texto do
-- histórico não pode mais assumir "via formulário público", e `p_solicitante_email` vira
-- opcional (o dialog interno preenche nome/e-mail automaticamente a partir de quem está
-- logado, mas não obriga).
--
-- `create or replace` não troca a ordem dos tipos de parâmetro (viraria uma function
-- sobrecarregada nova, não uma substituição) — por isso o drop explícito da assinatura antiga
-- antes de recriar.
drop function if exists criar_solicitacao_publica(
  text, text, text, text, prioridade_sugerida, text, text, date, text, text, text[]
);

create function criar_solicitacao_publica(
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
begin
  insert into tarefas (
    titulo, descricao, origem, departamento, solicitante_nome, solicitante_email,
    prioridade_sugerida, justificativa_prioridade, prazo, justificativa_prazo, observacoes,
    anexos, fase_atual_id, prioridade_final, data_inicio
  ) values (
    p_titulo, p_descricao, 'Solicitação', p_departamento, p_solicitante_nome, p_solicitante_email,
    p_prioridade_sugerida, p_justificativa_prioridade, p_prazo, p_justificativa_prazo, p_observacoes,
    coalesce(p_anexos, '{}'), 'solicitacoes', 'Normal', current_date
  )
  returning id into v_id;

  insert into historico_eventos (tarefa_id, descricao, fase_id)
  values (v_id, 'Solicitação registrada', 'solicitacoes');

  return v_id;
end;
$$;

grant execute on function criar_solicitacao_publica to anon, authenticated;
