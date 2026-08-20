type ResetFn = () => void;

const resets = new Set<ResetFn>();

/**
 * Cada store client-side (colaborador-store, task-store, etc.) chama isso uma vez, no
 * carregamento do módulo, registrando como voltar ao estado "não hidratado". Login e logout usam
 * Server Actions com `redirect()` — navegação client-side do App Router, sem reload do bundle —
 * então as variáveis de módulo desses stores sobrevivem à troca de usuário na mesma aba. Sem
 * resetar aqui, quem loga em seguida no mesmo navegador pode herdar cache (equipe, tarefas,
 * identidade do colaborador atual) da sessão anterior até um reload manual.
 */
export function registrarResetDeSessao(fn: ResetFn) {
  resets.add(fn);
}

export function resetarCachesDeSessao() {
  for (const fn of resets) fn();
}
