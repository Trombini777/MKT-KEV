import type { Colaborador, Squad } from "./types";

// Ids batem com os uuids reais da tabela `squads` no Supabase (mesmo ajuste feito em
// mock/projetos.ts — eram ids-slug que não existiam no banco, então qualquer FK contra esse id
// (ex.: cadastrar um colaborador com squad) falhava com "invalid input syntax for type uuid").
export const SQUADS: Squad[] = [
  { id: "10000000-0000-0000-0000-000000000001", nome: "Squad Conteúdo" },
  { id: "10000000-0000-0000-0000-000000000002", nome: "Squad Mídia Paga" },
  { id: "10000000-0000-0000-0000-000000000003", nome: "Squad Design" },
];

export const COLABORADORES: Colaborador[] = [
  {
    id: "beatriz",
    nome: "Beatriz Alves",
    email: "beatriz.alves@kevseguros.com.br",
    cargo: "Gerente de Marketing",
    skills: ["Planejamento", "Gestão de time", "Triagem"],
    capacidadeHorasSemana: 20,
    status: "Ativo",
    squadId: "10000000-0000-0000-0000-000000000001",
    avatarIniciais: "BA",
  },
  {
    id: "marcos",
    nome: "Eliezer Trombini",
    email: "eliezer.trombini@kevseguros.com.br",
    cargo: "Coordenador de Marketing",
    skills: ["Banner", "Peças gráficas", "Identidade visual"],
    capacidadeHorasSemana: 40,
    status: "Ativo",
    squadId: "10000000-0000-0000-0000-000000000003",
    avatarIniciais: "ET",
    avatarUrl: "/avatars/eliezer-trombini.jpg",
  },
  {
    id: "rafael",
    nome: "Rafael Lima",
    email: "rafael.lima@kevseguros.com.br",
    cargo: "Motion Designer",
    skills: ["Vídeo", "Motion", "Edição"],
    capacidadeHorasSemana: 40,
    status: "Ativo",
    squadId: "10000000-0000-0000-0000-000000000003",
    avatarIniciais: "RL",
  },
  {
    id: "carla",
    nome: "Carla Santos",
    email: "carla.santos@kevseguros.com.br",
    cargo: "Social Media",
    skills: ["Redes sociais", "Copy curta", "Reels"],
    capacidadeHorasSemana: 40,
    status: "Ativo",
    squadId: "10000000-0000-0000-0000-000000000001",
    avatarIniciais: "CS",
  },
  {
    id: "diego",
    nome: "Diego Silva",
    email: "diego.silva@kevseguros.com.br",
    cargo: "Redator",
    skills: ["Copywriting", "E-mail marketing", "Roteiro"],
    capacidadeHorasSemana: 40,
    status: "Ativo",
    squadId: "10000000-0000-0000-0000-000000000001",
    avatarIniciais: "DS",
  },
  {
    id: "juliana",
    nome: "Juliana Costa",
    email: "juliana.costa@kevseguros.com.br",
    cargo: "Analista de Mídia Paga",
    skills: ["Tráfego pago", "Analytics", "Landing pages"],
    capacidadeHorasSemana: 40,
    status: "Em Licença",
    squadId: "10000000-0000-0000-0000-000000000002",
    avatarIniciais: "JC",
  },
];
