-- Além de quem é o responsável padrão de Aprovação/Triagem, precisa saber quanto tempo cada
-- uma dessas etapas universais deveria levar (estimativa em horas + SLA em dias) — mesma
-- estrutura que já existe por etapa dentro de cada Tipo de Tarefa (ver tipo-tarefa-sheet.tsx) —
-- pra dar pra medir depois se o time está cumprindo o prazo padrão dessas duas etapas.
alter table configuracoes_fluxo
  add column if not exists estimativa_horas_aprovacao numeric,
  add column if not exists sla_dias_aprovacao integer,
  add column if not exists estimativa_horas_triagem numeric,
  add column if not exists sla_dias_triagem integer;
