-- Fila priorizada manualmente por fase (Triagem em diante — Solicitações não entra, é intake
-- não-priorizado). `null` = ainda não reordenado nessa fase (cai pro fim, ordenado por chegada);
-- só ganha um número quando alguém arrasta pela primeira vez pra reordenar (ver
-- reordenarTarefasNaFase, task-store.ts) — nesse momento TODAS as tarefas daquela fase recebem um
-- valor contíguo de uma vez, então não precisa mexer em nenhum dos pontos que já mudam
-- fase_atual_id hoje (moveTask, aplicarPlanejamento, avancarEtapaPlanejamento etc.).
alter table tarefas add column if not exists ordem_na_fase integer;
