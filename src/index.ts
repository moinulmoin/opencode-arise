import type { Plugin, PluginInput, Hooks } from "@opencode-ai/plugin";
import type { Event } from "@opencode-ai/sdk";
import { AriseConfigSchema, DEFAULT_CONFIG, type AriseConfig, type HookName, type ShadowName } from "./config/schema";
import { SHADOW_AGENTS, OPENCODE_OVERRIDES } from "./agents";
import {
  createAriseBannerHook,
  createOutputShaperHook,
  createCompactionPreserverHook,
  createTodoEnforcerHook,
} from "./hooks";
import {
  createCallAriseAgentTool,
  BackgroundManager,
  createBackgroundTaskTool,
  createBackgroundOutputTool,
  createBackgroundStatusTool,
  createBackgroundCancelTool,
} from "./tools";

type JsonObject = Record<string, unknown>;

const CONFIG_FILENAME = "opencode-arise.json";

async function loadAriseConfig(ctx: PluginInput): Promise<AriseConfig> {
  const paths = [
    `${ctx.worktree}/.opencode/${CONFIG_FILENAME}`,
    `${process.env.HOME}/.config/opencode/${CONFIG_FILENAME}`,
  ];

  let merged: JsonObject = { ...DEFAULT_CONFIG };

  for (const path of paths.reverse()) {
    try {
      const file = Bun.file(path);
      if (await file.exists()) {
        const content = await file.text();
        const parsed = JSON.parse(content);
        merged = deepMerge(merged, parsed);
      }
    } catch {
      // Config file doesn't exist or is invalid, continue
    }
  }

  const result = AriseConfigSchema.safeParse(merged);
  if (!result.success) {
    console.warn("[opencode-arise] Invalid config, using defaults:", result.error.message);
    return DEFAULT_CONFIG;
  }

  return result.data;
}

function deepMerge(base: JsonObject, override: JsonObject): JsonObject {
  const result: JsonObject = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      typeof result[key] === "object" &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key] as JsonObject, value as JsonObject);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function isHookEnabled(config: AriseConfig, hookName: HookName): boolean {
  return !(config.disabled_hooks ?? []).includes(hookName);
}

const OpencodeArise: Plugin = async (ctx: PluginInput): Promise<Hooks> => {
  const config = await loadAriseConfig(ctx);

  // Initialize background manager
  const backgroundManager = new BackgroundManager(ctx);

  // Initialize hooks
  const bannerHook = isHookEnabled(config, "arise-banner") && config.show_banner
    ? createAriseBannerHook(ctx)
    : null;

  const outputShaper = isHookEnabled(config, "output-shaper")
    ? createOutputShaperHook(config)
    : null;

  const compactionPreserver = isHookEnabled(config, "compaction-preserver")
    ? createCompactionPreserverHook()
    : null;

  const todoEnforcer = isHookEnabled(config, "todo-enforcer")
    ? createTodoEnforcerHook(ctx)
    : null;

  return {
    // Register custom tools
    tool: {
      arise_summon: createCallAriseAgentTool(ctx),
      arise_background: createBackgroundTaskTool(backgroundManager),
      arise_background_output: createBackgroundOutputTool(backgroundManager),
      arise_background_status: createBackgroundStatusTool(backgroundManager),
      arise_background_cancel: createBackgroundCancelTool(backgroundManager),
    },

    async config(opencodeConfig) {
      const cfg = opencodeConfig as JsonObject;

      // Set monarch as default agent
      cfg.default_agent = "monarch";

      // Initialize agent config if needed
      cfg.agent = (cfg.agent as JsonObject) ?? {};
      const agents = cfg.agent as JsonObject;

      // Add shadow soldiers
      const disabledShadows = new Set(config.disabled_shadows ?? []);
      for (const [name, shadow] of Object.entries(SHADOW_AGENTS)) {
        const shadowName = name as ShadowName;
        if (disabledShadows.has(shadowName)) continue;

        const userOverride = config.agents?.[shadowName];
        if (userOverride?.disabled) continue;

        agents[name] = {
          description: shadow.description,
          mode: shadow.mode,
          model: userOverride?.model ?? shadow.model,
          steps: shadow.steps,
          ...(shadow.prompt && { prompt: shadow.prompt }),
          ...(shadow.permission && { permission: shadow.permission }),
          ...(shadow.options && { options: shadow.options }),
        };
      }

      // Apply OpenCode agent overrides (make build/plan invokable, hide explore/general)
      for (const [name, override] of Object.entries(OPENCODE_OVERRIDES)) {
        agents[name] = deepMerge((agents[name] as JsonObject) ?? {}, override as JsonObject);
      }
    },

    async "tool.execute.after"(input, output) {
      if (outputShaper) {
        output.output = await outputShaper.shapeOutput(
          input.tool,
          output.output,
          output.metadata as Record<string, unknown>
        );
      }
    },

    async "experimental.session.compacting"(_input, output) {
      if (compactionPreserver) {
        output.context.push(compactionPreserver.getPreservationContext());
      }
    },

    async event(input: { event: Event }) {
      const event = input.event;

      // Let background manager handle events
      backgroundManager.handleEvent(event);

      // Show banner toast on session creation
      if (event.type === "session.created" && bannerHook) {
        await bannerHook.onSessionCreated();
      }

      // Handle session.idle for todo enforcement
      if (event.type === "session.idle" && todoEnforcer) {
        const sessionId = (event as { properties?: { sessionID?: string } }).properties?.sessionID;
        if (sessionId) {
          try {
            // Get recent messages to check for incomplete todos
            const messages = await ctx.client.session.messages({
              path: { id: sessionId },
            });

            if (messages.data) {
              // Extract text content from message parts
              const recentMessages = messages.data.slice(-5).map((m) => {
                const textContent = m.parts
                  ?.filter((p) => p.type === "text")
                  .map((p) => (p as { type: "text"; text: string }).text ?? "")
                  .join("\n") ?? "";
                return { content: textContent };
              });

              const result = await todoEnforcer.checkCompletion(recentMessages);

              if (result.hasIncompleteTodos && result.reminderMessage) {
                await ctx.client.tui.showToast({
                  body: {
                    title: "Arise - Incomplete Tasks",
                    message: "You have pending TODOs. Complete them before stopping.",
                    variant: "warning",
                    duration: 5000,
                  },
                });
              }
            }
          } catch {
            // Ignore errors in todo enforcement
          }
        }
      }
    },
  };
};

export default OpencodeArise;

// NOTE: Do NOT export non-type values from main index.ts!
// OpenCode treats ALL exports as plugin instances and tries to call them.
// Use "opencode-arise/agents" subpath if you need to import SHADOW_AGENTS.
export type { AriseConfig } from "./config/schema";
export type { ShadowAgent } from "./agents/shadows";
