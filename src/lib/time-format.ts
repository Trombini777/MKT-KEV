/** "01:30" -> 1.5 */
export function horarioParaDecimal(horario: string): number | undefined {
  if (!horario) return undefined;
  const [h, m] = horario.split(":").map(Number);
  return Math.round((h + m / 60) * 100) / 100;
}

/** 1.5 -> "01:30h" */
export function decimalParaHorario(decimal: number): string {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}h`;
}

/** 1.5 -> "01:30" (formato aceito pelo value de um <input type="time">) */
export function decimalParaHorarioInput(decimal: number): string {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
