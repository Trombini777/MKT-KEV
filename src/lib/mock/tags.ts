import type { Tag } from "./types";

export const TAGS: Tag[] = [
  { id: "urgente", nome: "Urgente" },
  { id: "campanha-sazonal", nome: "Campanha-Sazonal" },
  { id: "seguros-auto", nome: "Seguros Auto" },
  { id: "seguros-vida", nome: "Seguros Vida" },
  { id: "seguros-residencial", nome: "Seguros Residencial" },
  { id: "compliance", nome: "Compliance" },
];

export function tagById(id: string): Tag | undefined {
  return TAGS.find((t) => t.id === id);
}
