-- Reparo pontual de dados: `ajustarEtapaEmExecucao`/`replanejarEtapasDaAtividade` (task-store.ts)
-- só atualizavam `tarefas.previsao_conclusao`, nunca `planejamentos.previsao_conclusao` — os dois
-- deveriam sempre bater, mas iam desalinhando a cada ajuste/replanejamento. "Projeção de entrega"
-- exibe o valor de `planejamentos`; o badge "Atividade atrasada" calcula com o de `tarefas` — por
-- isso apareciam contradizendo um ao outro. Código já corrigido pra manter os dois em sync daqui
-- pra frente; este UPDATE só corrige o que já tinha divergido antes do fix.
update planejamentos p
set previsao_conclusao = t.previsao_conclusao
from tarefas t
where t.id = p.tarefa_id
  and p.previsao_conclusao is distinct from t.previsao_conclusao;
