const PALAVRAS_CARGO_GESTAO = [
  "coordenador",
  "coordenadora",
  "gerente",
  "superintendente",
  "diretor",
  "diretora",
  "head",
  "líder",
  "lider",
  "supervisor",
  "supervisora",
  "chefe",
  "vp",
  "presidente",
  "ceo",
  "cmo",
  "cto",
  "coo",
];

/** Coordenador pra cima = foco em gestão de time; abaixo disso = foco operacional/pessoal. */
export function ehCargoDeGestao(cargo: string): boolean {
  const cargoNormalizado = cargo.toLowerCase();
  return PALAVRAS_CARGO_GESTAO.some((palavra) => cargoNormalizado.includes(palavra));
}
