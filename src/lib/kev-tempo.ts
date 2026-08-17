const FORMATADOR = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Data/hora atual formatada em português, sempre no fuso de Brasília (independe do fuso do servidor). */
export function formatarAgoraBrasil(): string {
  return FORMATADOR.format(new Date());
}

const FORMATADOR_DATA_CURTA = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** Data de hoje no formato curto DD/MM/AAAA, fuso de Brasília — usado no cabeçalho da Daily. */
export function dataCurtaBrasil(): string {
  return FORMATADOR_DATA_CURTA.format(new Date());
}

const FORMATADOR_DATA_ISO = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" });

/**
 * Início do dia de hoje em Brasília, como timestamp ISO (`-03:00`) — usado pra filtrar
 * `criado_em >= ...` e separar "conversa de hoje" de dias anteriores. Brasil não tem mais
 * horário de verão desde 2019, então o offset fixo `-03:00` é seguro o ano inteiro.
 */
export function inicioDoDiaBrasilISO(): string {
  return `${FORMATADOR_DATA_ISO.format(new Date())}T00:00:00-03:00`;
}
