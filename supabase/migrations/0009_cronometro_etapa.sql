-- Cronômetro de tempo gasto por etapa (botão play/pausa no detalhe da tarefa): `tempo_gasto_horas`
-- acumula o total já pausado, `cronometro_iniciado_em` marca o início da contagem em andamento
-- (null = parado). Ao pausar, o app soma (agora - cronometro_iniciado_em) em `tempo_gasto_horas`
-- e zera `cronometro_iniciado_em` — sem isso não dá pra saber quanto tempo real foi gasto numa
-- etapa vs. o esforço estimado (planejamento_alocacoes, que é só a previsão).
alter table planejamento_etapas
  add column if not exists tempo_gasto_horas numeric not null default 0,
  add column if not exists cronometro_iniciado_em timestamptz;
