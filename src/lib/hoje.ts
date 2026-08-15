export function isoHoje(): string {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
}

export function diasEntre(isoInicio: string, isoFim: string): number {
  const [ay, am, ad] = isoInicio.split("-").map(Number);
  const [by, bm, bd] = isoFim.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}
