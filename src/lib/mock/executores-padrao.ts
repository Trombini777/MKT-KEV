import type { ExecutorPadrao } from "./types";

function key(tipoId: string, faseId: string) {
  return `${tipoId}:${faseId}`;
}

export const EXECUTORES_PADRAO: ExecutorPadrao = {
  [key("banner", "em-execucao")]: "marcos",
  [key("comunicado-interno", "em-execucao")]: "marcos",
  [key("material-campanha", "em-execucao")]: "marcos",
  [key("video", "em-execucao")]: "rafael",
  [key("post-social", "em-execucao")]: "carla",
  [key("email-marketing", "em-execucao")]: "diego",
  [key("peca-corretor", "em-execucao")]: "diego",

  [key("banner", "aprovacao")]: "marcos",
  [key("comunicado-interno", "aprovacao")]: "marcos",
  [key("material-campanha", "aprovacao")]: "marcos",
  [key("video", "aprovacao")]: "marcos",
  [key("post-social", "aprovacao")]: "marcos",
  [key("email-marketing", "aprovacao")]: "marcos",
  [key("peca-corretor", "aprovacao")]: "marcos",

  [key("banner", "triagem")]: "beatriz",
  [key("comunicado-interno", "triagem")]: "beatriz",
  [key("material-campanha", "triagem")]: "beatriz",
  [key("video", "triagem")]: "beatriz",
  [key("post-social", "triagem")]: "beatriz",
  [key("email-marketing", "triagem")]: "beatriz",
  [key("peca-corretor", "triagem")]: "beatriz",
};

export function executorPadrao(tipoId: string, faseId: string): string | undefined {
  return EXECUTORES_PADRAO[key(tipoId, faseId)];
}
