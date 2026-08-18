/** "01:30" -> 1.5 */
export function horarioParaDecimal(horario: string): number | undefined {
  if (!horario) return undefined;
  const [h, m] = horario.split(":").map(Number);
  return Math.round((h + m / 60) * 100) / 100;
}

/**
 * 1.5 -> "1:30h" — formato único de exibição de horas em todo o sistema (nunca decimal cru tipo
 * "1.5h" ou "0.7h"). Sem zero à esquerda na hora, minutos sempre com 2 dígitos.
 */
export function decimalParaHorario(decimal: number): string {
  let h = Math.floor(decimal);
  let m = Math.round((decimal - h) * 60);
  if (m === 60) {
    h += 1;
    m = 0;
  }
  return `${h}:${String(m).padStart(2, "0")}h`;
}

/** 1.5 -> "01:30" (formato aceito pelo value de um <input type="time">) */
export function decimalParaHorarioInput(decimal: number): string {
  let h = Math.floor(decimal);
  let m = Math.round((decimal - h) * 60);
  if (m === 60) {
    h += 1;
    m = 0;
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
