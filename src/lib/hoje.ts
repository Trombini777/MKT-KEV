/** Date -> "YYYY-MM-DD" em fuso local (evita o desvio de dia do `Date.toISOString()`, que passa por UTC). */
export function dataParaIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isoHoje(): string {
  return dataParaIso(new Date());
}

export function diasEntre(isoInicio: string, isoFim: string): number {
  const [ay, am, ad] = isoInicio.split("-").map(Number);
  const [by, bm, bd] = isoFim.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/** "2026-08-16" -> "16/08" */
export function formatDataCurta(iso: string): string {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

/** "2026-08-16" -> "16/08/2026" */
export function formatDataCompleta(iso: string): string {
  if (!iso) return "sem prazo definido";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** Células de uma grade de mês (semanas completas de 7 dias, com `null` de padding nas pontas). */
export function gerarGradeMes(ano: number, mes: number): (Date | null)[] {
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const offsetInicial = primeiroDia.getDay();

  const celulas: (Date | null)[] = [];
  for (let i = 0; i < offsetInicial; i++) celulas.push(null);
  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) celulas.push(new Date(ano, mes, dia));
  while (celulas.length % 7 !== 0) celulas.push(null);
  return celulas;
}

export const DIAS_SEMANA_CURTO = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export const NOMES_MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
