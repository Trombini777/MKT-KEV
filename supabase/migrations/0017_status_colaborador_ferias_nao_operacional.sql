-- Dois status novos de colaborador: "Férias" (ausência temporária, sem tratamento especial ainda
-- além do rótulo) e "Não operacional" (pessoa do time que não executa trabalho operacional — ex.:
-- alguém só de acompanhamento). Diferente de "Inativo", uma pessoa "Não operacional" continua
-- acessando o sistema normalmente pra visualizar, só não aparece como opção de executor em
-- nenhuma tela nem entra na grade de Workload (ver código: colaboradorEhOperacional em
-- src/lib/mock/colaboradores.ts).
alter type status_colaborador add value 'Férias';
alter type status_colaborador add value 'Não operacional';
