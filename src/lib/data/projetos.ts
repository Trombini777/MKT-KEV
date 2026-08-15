import { createClient } from "@/lib/supabase/server";
import type { Projeto } from "@/lib/mock";

const SELECT =
  "id, nome, sigla, descricao, tipo, departamento, responsavelId:responsavel_id, dataInicio:data_inicio, dataFim:data_fim, notasEncerramento:notas_encerramento";

/** Leitura server-side dos projetos/campanhas — sem tela de criação ainda (ver docs/PLAN.md M3). */
export async function getProjetos(): Promise<Projeto[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projetos").select(SELECT).order("nome");
  if (error) {
    console.error("Falha ao carregar projetos:", error.message);
    return [];
  }
  return (data ?? []) as unknown as Projeto[];
}
