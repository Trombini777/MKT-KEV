/**
 * `<input type="date">` deixa passar anos absurdos se a pessoa digitar só 1-2 dígitos no campo
 * de ano em vez de colar/escolher a data (ex.: "56" vira "0056") — sem essa checagem, esse tipo
 * de erro de digitação vai direto pro banco e aparece formatado errado no resto do app.
 */
const ANO_MINIMO = 2000;
const ANO_MAXIMO = 2100;

export function anoDoPrazoValido(iso: string): boolean {
  const ano = Number(iso.slice(0, 4));
  return Number.isFinite(ano) && ano >= ANO_MINIMO && ano <= ANO_MAXIMO;
}

export const MENSAGEM_ANO_INVALIDO = "Data inválida — confira o ano.";
