-- Sistema Kev Marketing — seed inicial, a partir dos dados mock atuais (src/lib/mock/*.ts).
-- Rodar DEPOIS de supabase/migrations/0001_init_schema.sql, no mesmo SQL Editor.
--
-- Tabela `tarefas` (e filhas: checklist, comentários, histórico, planejamentos) fica
-- deliberadamente VAZIA — as ~20 tarefas do mock são só dado de demonstração da fase UI-first,
-- não faz sentido carregar isso pro banco real. O time começa a criar tarefas de verdade
-- direto pela UI depois que o Auth estiver ligado.
--
-- UUIDs abaixo são literais fixos (não gen_random_uuid()) só pra facilitar reuso como FK dentro
-- deste mesmo arquivo, sem precisar de subquery por nome em toda linha. Prefixo indica a
-- entidade: 1=squads, 2=colaboradores, 3=unidades_medida, 4=etapas, 5=tags, 6=tipos_tarefa,
-- 7=projetos.

-- =========================================================================
-- Squads
-- =========================================================================
insert into squads (id, nome) values
  ('10000000-0000-0000-0000-000000000001', 'Squad Conteúdo'),
  ('10000000-0000-0000-0000-000000000002', 'Squad Mídia Paga'),
  ('10000000-0000-0000-0000-000000000003', 'Squad Design');

-- =========================================================================
-- Colaboradores (auth_user_id fica NULL — liga depois que cada um criar a própria conta)
-- =========================================================================
insert into colaboradores (id, nome, email, cargo, skills, capacidade_horas_semana, status, squad_id, avatar_iniciais, avatar_url, perfil) values
  ('20000000-0000-0000-0000-000000000001', 'Beatriz Alves', 'beatriz.alves@kevseguros.com.br', 'Gerente de Marketing', array['Planejamento','Gestão de time','Triagem'], 20, 'Ativo', '10000000-0000-0000-0000-000000000001', 'BA', null, 'Admin'),
  ('20000000-0000-0000-0000-000000000002', 'Eliezer Trombini', 'eliezer.trombini@kevseguros.com.br', 'Coordenador de Marketing', array['Banner','Peças gráficas','Identidade visual'], 40, 'Ativo', '10000000-0000-0000-0000-000000000003', 'ET', '/avatars/eliezer-trombini.jpg', 'Admin'),
  ('20000000-0000-0000-0000-000000000003', 'Rafael Lima', 'rafael.lima@kevseguros.com.br', 'Motion Designer', array['Vídeo','Motion','Edição'], 40, 'Ativo', '10000000-0000-0000-0000-000000000003', 'RL', null, 'Editor'),
  ('20000000-0000-0000-0000-000000000004', 'Carla Santos', 'carla.santos@kevseguros.com.br', 'Social Media', array['Redes sociais','Copy curta','Reels'], 40, 'Ativo', '10000000-0000-0000-0000-000000000001', 'CS', null, 'Editor'),
  ('20000000-0000-0000-0000-000000000005', 'Diego Silva', 'diego.silva@kevseguros.com.br', 'Redator', array['Copywriting','E-mail marketing','Roteiro'], 40, 'Ativo', '10000000-0000-0000-0000-000000000001', 'DS', null, 'Editor'),
  ('20000000-0000-0000-0000-000000000006', 'Juliana Costa', 'juliana.costa@kevseguros.com.br', 'Analista de Mídia Paga', array['Tráfego pago','Analytics','Landing pages'], 40, 'Em Licença', '10000000-0000-0000-0000-000000000002', 'JC', null, 'Editor');

-- =========================================================================
-- Unidades de medida
-- =========================================================================
insert into unidades_medida (id, nome) values
  ('30000000-0000-0000-0000-000000000001', 'Slide'),
  ('30000000-0000-0000-0000-000000000002', 'Página'),
  ('30000000-0000-0000-0000-000000000003', 'Arte');

-- =========================================================================
-- Etapas (catálogo reutilizável, aba "Etapas")
-- =========================================================================
insert into etapas (id, nome, categoria) values
  ('40000000-0000-0000-0000-000000000001', 'Briefing', 'Backlog'),
  ('40000000-0000-0000-0000-000000000002', 'Roteiro', 'Backlog'),
  ('40000000-0000-0000-0000-000000000003', 'Redação', 'Em Execução'),
  ('40000000-0000-0000-0000-000000000004', 'Design', 'Em Execução'),
  ('40000000-0000-0000-0000-000000000005', 'Gravação', 'Em Execução'),
  ('40000000-0000-0000-0000-000000000006', 'Edição', 'Em Execução'),
  ('40000000-0000-0000-0000-000000000007', 'Revisão Interna', 'Em Aprovação'),
  ('40000000-0000-0000-0000-000000000008', 'Aprovação Solicitante', 'Em Aprovação'),
  ('40000000-0000-0000-0000-000000000009', 'Publicação', 'Concluído'),
  ('4000000a-0000-0000-0000-00000000000a', 'Disparo', 'Concluído'),
  ('4000000b-0000-0000-0000-00000000000b', 'Envio', 'Concluído'),
  ('4000000c-0000-0000-0000-00000000000c', 'Entrega', 'Concluído');

-- =========================================================================
-- Tags
-- =========================================================================
insert into tags (id, nome) values
  ('50000000-0000-0000-0000-000000000001', 'Urgente'),
  ('50000000-0000-0000-0000-000000000002', 'Campanha-Sazonal'),
  ('50000000-0000-0000-0000-000000000003', 'Seguros Auto'),
  ('50000000-0000-0000-0000-000000000004', 'Seguros Vida'),
  ('50000000-0000-0000-0000-000000000005', 'Seguros Residencial'),
  ('50000000-0000-0000-0000-000000000006', 'Compliance');

-- =========================================================================
-- Departamentos (18 de ~29 conhecidos — ver src/lib/departamentos.ts)
-- =========================================================================
insert into departamentos (id, nome) values
  ('Agronegócio', 'Agronegócio'),
  ('Assistência Financeira', 'Assistência Financeira'),
  ('Autoday', 'Autoday'),
  ('Bancassurance', 'Bancassurance'),
  ('Comercial', 'Comercial'),
  ('Conecta', 'Conecta'),
  ('Diretoria Executiva', 'Diretoria Executiva'),
  ('Estrutural', 'Estrutural'),
  ('Financeiro', 'Financeiro'),
  ('Jurídico', 'Jurídico'),
  ('KEV', 'KEV'),
  ('Marketing', 'Marketing'),
  ('Operações', 'Operações'),
  ('Projetos', 'Projetos'),
  ('RH', 'RH'),
  ('Side', 'Side'),
  ('Sinistros', 'Sinistros'),
  ('Tecnologia', 'Tecnologia');

-- =========================================================================
-- Fases + transições (fluxo padrão do sistema)
-- =========================================================================
insert into fases (id, nome, ordem, sla_dias, is_final, modo_execucao) values
  ('solicitacoes', 'Solicitações', 1, 2, false, 'Individual'),
  ('triagem', 'Triagem', 2, 1, false, 'Individual'),
  ('aguardando-info', 'Aguardando Informações', 3, 5, false, 'Individual'),
  ('backlog', 'Backlog', 4, 3, false, 'Individual'),
  ('em-execucao', 'Em Execução', 5, 4, false, 'Individual'),
  ('aprovacao', 'Aprovação', 6, 2, false, 'Individual'),
  ('concluido', 'Concluído', 7, 0, true, 'Individual');

insert into transicoes (de, para, label) values
  ('solicitacoes', 'triagem', 'revisão'),
  ('triagem', 'backlog', 'aprova'),
  ('triagem', 'aguardando-info', 'falta info'),
  ('aguardando-info', 'triagem', 'recebida'),
  ('backlog', 'em-execucao', 'início'),
  ('em-execucao', 'aprovacao', 'pronto'),
  ('aprovacao', 'concluido', 'aprovado'),
  ('aprovacao', 'em-execucao', 'pede ajuste');

-- =========================================================================
-- Tipos de Tarefa
-- =========================================================================
insert into tipos_tarefa (id, nome, descricao, ativo, unidade_medida_id, atualizado_em) values
  ('60000000-0000-0000-0000-000000000001', 'Post Social', 'Peça única para redes sociais — feed, stories ou carrossel.', true, '30000000-0000-0000-0000-000000000003', '2026-07-22'),
  ('60000000-0000-0000-0000-000000000002', 'E-mail Marketing', 'Campanha de e-mail para a base de clientes ou leads.', true, null, '2026-06-30'),
  ('60000000-0000-0000-0000-000000000003', 'Peça para Corretor', 'Material de apoio para corretores parceiros usarem na venda.', true, '30000000-0000-0000-0000-000000000002', '2026-05-14'),
  ('60000000-0000-0000-0000-000000000004', 'Banner', 'Banner para site, redes sociais ou landing pages.', true, '30000000-0000-0000-0000-000000000003', '2026-08-01'),
  ('60000000-0000-0000-0000-000000000005', 'Vídeo', 'Vídeo institucional, publicitário ou educativo.', true, null, '2026-04-09'),
  ('60000000-0000-0000-0000-000000000006', 'Comunicado Interno', 'Comunicado para o time interno da Kev.', true, null, '2026-08-05'),
  ('60000000-0000-0000-0000-000000000007', 'Material de Campanha', 'Material de apoio para campanhas e ações comerciais.', true, '30000000-0000-0000-0000-000000000002', '2026-03-18');

-- Post Social
insert into tipos_tarefa_etapas (tipo_tarefa_id, etapa_id, ordem, estimativa_horas, executor_padrao_id, depende_de, pode_dividir, executores_permitidos_ids) values
  ('60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 1, 1,   '20000000-0000-0000-0000-000000000001', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', 2, 2,   '20000000-0000-0000-0000-000000000005', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000004', 3, 3,   '20000000-0000-0000-0000-000000000002', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000008', 4, 0.5, '20000000-0000-0000-0000-000000000002', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000009', 5, 0.5, '20000000-0000-0000-0000-000000000004', '{}', false, '{}');

-- E-mail Marketing
insert into tipos_tarefa_etapas (tipo_tarefa_id, etapa_id, ordem, estimativa_horas, executor_padrao_id, depende_de, pode_dividir, executores_permitidos_ids) values
  ('60000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 1, 1,   '20000000-0000-0000-0000-000000000001', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003', 2, 2,   '20000000-0000-0000-0000-000000000005', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000004', 3, 3,   '20000000-0000-0000-0000-000000000002', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000007', 4, 1,   '20000000-0000-0000-0000-000000000002', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000008', 5, 0.5, '20000000-0000-0000-0000-000000000002', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000002', '4000000a-0000-0000-0000-00000000000a', 6, 0.5, '20000000-0000-0000-0000-000000000005', '{}', false, '{}');

-- Peça para Corretor
insert into tipos_tarefa_etapas (tipo_tarefa_id, etapa_id, ordem, estimativa_horas, executor_padrao_id, depende_de, pode_dividir, executores_permitidos_ids) values
  ('60000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', 1, 1,   '20000000-0000-0000-0000-000000000001', '{}',  true, '{}'),
  ('60000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000004', 2, 3,   '20000000-0000-0000-0000-000000000002', '{1}', true, array['20000000-0000-0000-0000-000000000003']::uuid[]),
  ('60000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000007', 3, 1,   '20000000-0000-0000-0000-000000000002', '{2}', true, '{}'),
  ('60000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000008', 4, 0.5, '20000000-0000-0000-0000-000000000002', '{3}', true, '{}'),
  ('60000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000009', 5, 0.5, '20000000-0000-0000-0000-000000000002', '{4}', true, '{}');

-- Banner
insert into tipos_tarefa_etapas (tipo_tarefa_id, etapa_id, ordem, estimativa_horas, executor_padrao_id, depende_de, pode_dividir, executores_permitidos_ids) values
  ('60000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000001', 1, 1,   '20000000-0000-0000-0000-000000000001', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000003', 2, 2,   '20000000-0000-0000-0000-000000000005', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004', 3, 3,   '20000000-0000-0000-0000-000000000002', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000007', 4, 1,   '20000000-0000-0000-0000-000000000002', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000008', 5, 0.5, '20000000-0000-0000-0000-000000000002', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000009', 6, 0.5, '20000000-0000-0000-0000-000000000004', '{}', false, '{}');

-- Vídeo
insert into tipos_tarefa_etapas (tipo_tarefa_id, etapa_id, ordem, estimativa_horas, executor_padrao_id, depende_de, pode_dividir, executores_permitidos_ids) values
  ('60000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000001', 1, 1,   '20000000-0000-0000-0000-000000000001', '{}',  true, '{}'),
  ('60000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000002', 2, 2,   '20000000-0000-0000-0000-000000000005', '{1}', true, '{}'),
  ('60000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000005', 3, 4,   '20000000-0000-0000-0000-000000000003', '{2}', false, array['20000000-0000-0000-0000-000000000002']::uuid[]),
  ('60000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000006', 4, 4,   '20000000-0000-0000-0000-000000000003', '{3}', true, '{}'),
  ('60000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000007', 5, 1,   '20000000-0000-0000-0000-000000000002', '{4}', true, array['20000000-0000-0000-0000-000000000001']::uuid[]),
  ('60000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000008', 6, 0.5, '20000000-0000-0000-0000-000000000002', '{5}', true, '{}'),
  ('60000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000009', 7, 0.5, '20000000-0000-0000-0000-000000000004', '{6}', true, '{}');

-- Comunicado Interno
insert into tipos_tarefa_etapas (tipo_tarefa_id, etapa_id, ordem, estimativa_horas, executor_padrao_id, depende_de, pode_dividir, executores_permitidos_ids) values
  ('60000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000001', 1, 1,   '20000000-0000-0000-0000-000000000001', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000003', 2, 2,   '20000000-0000-0000-0000-000000000005', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000007', 3, 1,   '20000000-0000-0000-0000-000000000002', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000008', 4, 0.5, '20000000-0000-0000-0000-000000000002', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000006', '4000000b-0000-0000-0000-00000000000b', 5, 0.5, '20000000-0000-0000-0000-000000000001', '{}', false, '{}');

-- Material de Campanha
insert into tipos_tarefa_etapas (tipo_tarefa_id, etapa_id, ordem, estimativa_horas, executor_padrao_id, depende_de, pode_dividir, executores_permitidos_ids) values
  ('60000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000001', 1, 1,   '20000000-0000-0000-0000-000000000001', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000004', 2, 3,   '20000000-0000-0000-0000-000000000002', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000007', 3, 1,   '20000000-0000-0000-0000-000000000002', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000008', 4, 0.5, '20000000-0000-0000-0000-000000000002', '{}', false, '{}'),
  ('60000000-0000-0000-0000-000000000007', '4000000c-0000-0000-0000-00000000000c', 5, 0.5, '20000000-0000-0000-0000-000000000002', '{}', false, '{}');

-- Executores padrão por Tipo × Fase (em-execucao, aprovacao, triagem)
insert into tipos_tarefa_executores_padrao (tipo_tarefa_id, fase_id, colaborador_id) values
  ('60000000-0000-0000-0000-000000000004', 'em-execucao', '20000000-0000-0000-0000-000000000002'),
  ('60000000-0000-0000-0000-000000000004', 'aprovacao',   '20000000-0000-0000-0000-000000000002'),
  ('60000000-0000-0000-0000-000000000004', 'triagem',     '20000000-0000-0000-0000-000000000001'),

  ('60000000-0000-0000-0000-000000000006', 'em-execucao', '20000000-0000-0000-0000-000000000002'),
  ('60000000-0000-0000-0000-000000000006', 'aprovacao',   '20000000-0000-0000-0000-000000000002'),
  ('60000000-0000-0000-0000-000000000006', 'triagem',     '20000000-0000-0000-0000-000000000001'),

  ('60000000-0000-0000-0000-000000000007', 'em-execucao', '20000000-0000-0000-0000-000000000002'),
  ('60000000-0000-0000-0000-000000000007', 'aprovacao',   '20000000-0000-0000-0000-000000000002'),
  ('60000000-0000-0000-0000-000000000007', 'triagem',     '20000000-0000-0000-0000-000000000001'),

  ('60000000-0000-0000-0000-000000000005', 'em-execucao', '20000000-0000-0000-0000-000000000003'),
  ('60000000-0000-0000-0000-000000000005', 'aprovacao',   '20000000-0000-0000-0000-000000000002'),
  ('60000000-0000-0000-0000-000000000005', 'triagem',     '20000000-0000-0000-0000-000000000001'),

  ('60000000-0000-0000-0000-000000000001', 'em-execucao', '20000000-0000-0000-0000-000000000004'),
  ('60000000-0000-0000-0000-000000000001', 'aprovacao',   '20000000-0000-0000-0000-000000000002'),
  ('60000000-0000-0000-0000-000000000001', 'triagem',     '20000000-0000-0000-0000-000000000001'),

  ('60000000-0000-0000-0000-000000000002', 'em-execucao', '20000000-0000-0000-0000-000000000005'),
  ('60000000-0000-0000-0000-000000000002', 'aprovacao',   '20000000-0000-0000-0000-000000000002'),
  ('60000000-0000-0000-0000-000000000002', 'triagem',     '20000000-0000-0000-0000-000000000001'),

  ('60000000-0000-0000-0000-000000000003', 'em-execucao', '20000000-0000-0000-0000-000000000005'),
  ('60000000-0000-0000-0000-000000000003', 'aprovacao',   '20000000-0000-0000-0000-000000000002'),
  ('60000000-0000-0000-0000-000000000003', 'triagem',     '20000000-0000-0000-0000-000000000001');

-- =========================================================================
-- Projetos
-- =========================================================================
insert into projetos (id, nome, sigla, descricao, tipo, departamento, responsavel_id, data_inicio, data_fim) values
  ('70000000-0000-0000-0000-000000000001', 'Dia das Mães 2026', 'DMÃES26', 'Campanha sazonal de seguro de vida e assistência financeira para o Dia das Mães.', 'Campanha', 'Comercial', '20000000-0000-0000-0000-000000000001', '2026-07-15', '2026-08-20'),
  ('70000000-0000-0000-0000-000000000002', 'IPVA SP 2026', 'IPVA26', 'Campanha de prevenção e cross-sell de seguro auto durante a janela de IPVA em SP.', 'Campanha', 'Autoday', '20000000-0000-0000-0000-000000000001', '2026-07-01', '2026-09-10'),
  ('70000000-0000-0000-0000-000000000003', 'Renovação de Apólice', 'RENOV26', 'Comunicação recorrente para clientes com apólice próxima do vencimento.', 'Projeto', 'Comercial', '20000000-0000-0000-0000-000000000002', '2026-08-01', '2026-10-31');
