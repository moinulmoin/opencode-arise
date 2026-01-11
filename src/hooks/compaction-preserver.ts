export function createCompactionPreserverHook() {
  return {
    getPreservationContext(): string {
      return `[opencode-arise] Compaction preservation rules:
- PRESERVE: All TODO items (pending, in_progress, completed)
- PRESERVE: Key decisions and assumptions made
- PRESERVE: File paths that were touched/edited
- PRESERVE: Commands run and their key outputs (especially errors)
- PRESERVE: Shadow delegations and their results
- PRUNE: Verbose tool outputs (grep results, large file contents)
- PRUNE: Repetitive exploration that didn't yield results

Summarize work done, but keep enough context for the Monarch to continue.`;
    },
  };
}
