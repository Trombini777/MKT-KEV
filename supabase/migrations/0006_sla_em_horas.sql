-- SLA de Aprovação/Triagem faz mais sentido em horas do que em dias (são etapas de minutos de
-- esforço real, mas que podem ficar horas na fila até alguém conseguir parar pra fazer) — os
-- campos de dias criados na 0005 nunca chegaram a ser usados (ainda null), então é seguro trocar
-- direto por colunas em horas em vez de fazer uma migração de dado.
alter table configuracoes_fluxo
  drop column if exists sla_dias_aprovacao,
  drop column if exists sla_dias_triagem,
  add column if not exists sla_horas_aprovacao numeric,
  add column if not exists sla_horas_triagem numeric;
