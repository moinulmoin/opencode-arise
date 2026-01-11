import { z } from "zod";

export const ShadowName = z.enum([
  "monarch",
  "beru",
  "igris",
  "bellion",
  "tusk",
  "tank",
  "shadow-sovereign",
]);
export type ShadowName = z.infer<typeof ShadowName>;

export const HookName = z.enum([
  "arise-banner",
  "output-shaper",
  "compaction-preserver",
  "todo-enforcer",
]);
export type HookName = z.infer<typeof HookName>;

export const AgentOverride = z.object({
  model: z.string().optional(),
  disabled: z.boolean().optional(),
});

export const AriseConfigSchema = z.object({
  $schema: z.string().optional(),
  disabled_shadows: z.array(ShadowName).optional(),
  disabled_hooks: z.array(HookName).optional(),
  show_banner: z.boolean().default(true),
  banner_every_session: z.boolean().default(false),
  agents: z.record(ShadowName, AgentOverride).optional(),
  output_shaping: z
    .object({
      max_chars: z.number().default(12000),
      preserve_errors: z.boolean().default(true),
    })
    .optional(),
  compaction: z
    .object({
      threshold_percent: z.number().min(50).max(95).default(80),
      preserve_todos: z.boolean().default(true),
    })
    .optional(),
});

export type AriseConfig = z.infer<typeof AriseConfigSchema>;

export const DEFAULT_CONFIG: AriseConfig = {
  show_banner: true,
  banner_every_session: false,
  disabled_shadows: [],
  disabled_hooks: [],
  output_shaping: {
    max_chars: 12000,
    preserve_errors: true,
  },
  compaction: {
    threshold_percent: 80,
    preserve_todos: true,
  },
};
