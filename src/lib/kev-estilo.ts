// Compartilhado entre src/lib/kev.ts e src/lib/kev-tarefa.ts — módulo separado (sem "use server")
// porque um arquivo com essa diretiva só pode exportar funções async (regra de Server Actions do
// Next.js), então essa constante não pode viver dentro de kev.ts.
export const REGRAS_ESTILO =
  `Regras de estilo, sem exceção:\n` +
  `- Não use travessão (—) em nenhuma frase.\n` +
  `- Não ofereça duas leituras com "ou" nas frases de afirmação (nada de "X ou talvez Y").` +
  ` Escolha UMA leitura do momento e comprometa-se com ela em frases curtas e declarativas.\n` +
  `- Escreva em parágrafos bem curtos (1 frase cada, no máximo 2), separados por uma linha em` +
  ` branco entre eles, como alguém mandando algumas mensagens curtas seguidas numa conversa de texto.`;
