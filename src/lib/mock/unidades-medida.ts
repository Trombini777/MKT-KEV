import type { UnidadeMedida } from "./types";

export const UNIDADES_MEDIDA: UnidadeMedida[] = [
  { id: "slide", nome: "Slide" },
  { id: "pagina", nome: "Página" },
  { id: "arte", nome: "Arte" },
];

export function unidadeMedidaById(id: string): UnidadeMedida | undefined {
  return UNIDADES_MEDIDA.find((u) => u.id === id);
}
