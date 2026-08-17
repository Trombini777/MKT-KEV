-- Status da atividade (Ativa/Pausada/Concluída/Arquivada) — ortogonal à fase do fluxo
-- (fase_atual_id). Nasce "Ativa"; vira "Concluída" automaticamente quando a tarefa chega na fase
-- final "concluido" (ver task-store.ts moveTask/avancarEtapaPlanejamento); "Pausada"/"Arquivada"
-- são decisões manuais do usuário e tiram a tarefa da contagem de Workload e Painel de Trabalho,
-- sem apagar o registro (mesmo padrão de supabase/migrations/0007_status_projeto.sql).

create type status_atividade as enum ('Ativa', 'Pausada', 'Concluída', 'Arquivada');

alter table tarefas
  add column if not exists status status_atividade not null default 'Ativa';

update tarefas set status = 'Ativa' where status is null;
