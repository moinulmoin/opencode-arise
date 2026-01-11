import type { PluginInput } from "@opencode-ai/plugin";

const TODO_PATTERNS = [
  /\[pending\]/i,
  /\[in_progress\]/i,
  /- \[ \]/,
  /TODO:/i,
  /FIXME:/i,
];

const COMPLETION_PATTERNS = [
  /\[completed\]/i,
  /\[done\]/i,
  /- \[x\]/i,
];

export function createTodoEnforcerHook(_ctx: PluginInput) {
  return {
    async checkCompletion(messages: Array<{ content: string }>): Promise<{
      hasIncompleteTodos: boolean;
      reminderMessage?: string;
    }> {
      const lastAssistantMessages = messages
        .filter((m) => m.content)
        .slice(-5);

      let hasPending = false;
      let hasInProgress = false;

      for (const msg of lastAssistantMessages) {
        const content = msg.content;
        if (TODO_PATTERNS.some((p) => p.test(content))) {
          if (/\[pending\]/i.test(content) || /- \[ \]/.test(content)) {
            hasPending = true;
          }
          if (/\[in_progress\]/i.test(content)) {
            hasInProgress = true;
          }
        }
      }

      const hasIncompleteTodos = hasPending || hasInProgress;

      if (hasIncompleteTodos) {
        return {
          hasIncompleteTodos: true,
          reminderMessage: `[opencode-arise] Shadow Monarch notice: You have incomplete TODOs. ${
            hasInProgress ? "Tasks are in_progress." : ""
          } ${hasPending ? "Tasks are pending." : ""} Complete them before stopping.`,
        };
      }

      return { hasIncompleteTodos: false };
    },
  };
}
