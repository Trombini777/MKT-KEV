-- Atividades eram movidas da Triagem pra Backlog/Execução/Aprovação pelo "Mover card para fase" ou
-- arrastando no Kanban sem passar por "Planejar atividade" — ficavam sem etapas e sem como planejar
-- (o planejamento só aparece na Triagem). O front já bloqueia (ver exigePlanejamento em
-- src/lib/mock/fluxo.ts); aqui:
--   1) reparo: volta pra Triagem as que estão nesse estado (Concluídas ficam como estão — são
--      entregas antigas, anteriores ao planejamento por etapas);
--   2) trava no banco pra qualquer caminho futuro que tente o mesmo.

insert into historico_eventos (tarefa_id, descricao, fase_id)
select t.id, 'Voltou para Triagem — tinha avançado sem planejamento da atividade', 'triagem'
from tarefas t
where t.fase_atual_id in ('backlog', 'em-execucao', 'aprovacao')
  and not exists (select 1 from planejamentos p where p.tarefa_id = t.id);

update tarefas t
set fase_atual_id = 'triagem', ordem_na_fase = null
where t.fase_atual_id in ('backlog', 'em-execucao', 'aprovacao')
  and not exists (select 1 from planejamentos p where p.tarefa_id = t.id);

create or replace function exige_planejamento_para_avancar()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.fase_atual_id in ('backlog', 'em-execucao', 'aprovacao', 'concluido')
     and new.fase_atual_id is distinct from old.fase_atual_id
     and not exists (select 1 from planejamentos p where p.tarefa_id = new.id) then
    raise exception 'Atividade sem planejamento não pode sair da Triagem (destino: %)', new.fase_atual_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_exige_planejamento_para_avancar on tarefas;
create trigger trg_exige_planejamento_para_avancar
  before update of fase_atual_id on tarefas
  for each row execute function exige_planejamento_para_avancar();
