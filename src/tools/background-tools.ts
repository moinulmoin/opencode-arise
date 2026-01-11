import { tool, type ToolContext } from "@opencode-ai/plugin";
import type { BackgroundManager } from "./background-manager";
import type { ShadowName } from "../config/schema";

const BACKGROUND_SHADOWS: ShadowName[] = ["beru", "tank", "bellion"];

export function createBackgroundTaskTool(manager: BackgroundManager): ReturnType<typeof tool> {
  return tool({
    description: `Launch a shadow soldier as a background task for parallel execution.

Best for:
- beru: Parallel codebase exploration
- tank: Parallel external research
- bellion: Parallel planning/analysis

Returns a task_id immediately. Use arise_background_output to get results later.`,

    args: {
      shadow: tool.schema
        .enum(BACKGROUND_SHADOWS)
        .describe("Which shadow to run in background"),
      prompt: tool.schema
        .string()
        .describe("The task for the shadow"),
      description: tool.schema
        .string()
        .describe("Short description (3-5 words)"),
    },

    async execute(args, context: ToolContext) {
      const { shadow, prompt, description } = args;

      try {
        const task = await manager.launch({
          shadow,
          prompt,
          description,
          parentSessionId: context.sessionID,
        });

        return `[arise] Shadow ${shadow} launched in background.

Task ID: ${task.id}
Description: ${description}

Use arise_background_output("${task.id}") when you need the result.`;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return `[arise] Failed to launch background task: ${msg}`;
      }
    },
  });
}

export function createBackgroundOutputTool(manager: BackgroundManager): ReturnType<typeof tool> {
  return tool({
    description: `Get the output from a background shadow task.`,

    args: {
      task_id: tool.schema
        .string()
        .describe("The task ID from arise_background"),
    },

    async execute(args) {
      const task = manager.getTask(args.task_id);

      if (!task) {
        return `[arise] Task not found: ${args.task_id}`;
      }

      const duration = task.completedAt
        ? Math.round((task.completedAt - task.startedAt) / 1000)
        : Math.round((Date.now() - task.startedAt) / 1000);

      if (task.status === "running") {
        return `[arise] Task still running (${duration}s). Check again later.`;
      }

      if (task.status === "error") {
        return `[arise] Task failed: ${task.error ?? "Unknown error"}`;
      }

      return `[arise] ${task.shadow} completed (${duration}s):

${task.result ?? "(No output)"}`;
    },
  });
}

export function createBackgroundStatusTool(manager: BackgroundManager): ReturnType<typeof tool> {
  return tool({
    description: "List all background tasks and their status.",

    args: {
      current_session_only: tool.schema
        .boolean()
        .optional()
        .describe("Only show tasks from current session"),
    },

    async execute(args, context: ToolContext) {
      let tasks = manager.getAllTasks();

      if (args.current_session_only) {
        tasks = tasks.filter((t) => t.parentSessionId === context.sessionID);
      }

      if (tasks.length === 0) {
        return "[arise] No background tasks.";
      }

      const lines = tasks.map((t) => {
        const duration = t.completedAt
          ? Math.round((t.completedAt - t.startedAt) / 1000)
          : Math.round((Date.now() - t.startedAt) / 1000);

        return `- ${t.id}: ${t.shadow} | ${t.status} | ${t.description} (${duration}s)`;
      });

      return `[arise] Background tasks:\n${lines.join("\n")}`;
    },
  });
}

export function createBackgroundCancelTool(manager: BackgroundManager): ReturnType<typeof tool> {
  return tool({
    description: "Cancel a running background task.",

    args: {
      task_id: tool.schema
        .string()
        .describe("The task ID to cancel"),
    },

    async execute(args) {
      const success = await manager.cancelTask(args.task_id);

      if (success) {
        return `[arise] Task ${args.task_id} cancelled.`;
      } else {
        return `[arise] Could not cancel task (not found or already completed).`;
      }
    },
  });
}
