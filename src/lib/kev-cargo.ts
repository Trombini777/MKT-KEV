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

/** Time de tecnologia (ex.: Rafael e Edson, avaliando o sistema) — não são do marketing, então o
 * keV muda de "organizar seu trabalho" pra "apresentar o sistema" com essas pessoas. */
export function ehTimeDeTecnologia(cargo: string): boolean {
  const cargoNormalizado = cargo.toLowerCase();
  return cargoNormalizado.includes("tecnologia") || /\btech\b/.test(cargoNormalizado);
}
