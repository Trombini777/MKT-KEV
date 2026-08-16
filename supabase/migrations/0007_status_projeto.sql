-- Projetos/campanhas precisam de um status próprio pra controlar quais aparecem como "ativos" na
-- hora de vincular uma tarefa (triagem e lista de execução) — até aqui isso era inferido só pela
-- data_fim, o que não deixa pausar/cancelar um projeto antes do prazo nem reabrir um vencido.
create type status_projeto as enum ('Planejado', 'Ativo', 'Concluído', 'Cancelado');

alter table projetos
  add column if not exists status status_projeto not null default 'Ativo';

-- Os 3 projetos/campanhas semeados hoje estão todos em andamento.
update projetos set status = 'Ativo';
