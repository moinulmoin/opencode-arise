import { describe, expect, test } from "bun:test";
import { SHADOW_AGENTS, OPENCODE_OVERRIDES } from "./shadows";

describe("Shadow Agents", () => {
  test("has all expected shadows", () => {
    const expectedShadows = [
      "monarch",
      "beru",
      "igris",
      "bellion",
      "tusk",
      "tank",
      "shadow-sovereign",
    ];
    for (const name of expectedShadows) {
      expect(SHADOW_AGENTS[name]).toBeDefined();
    }
  });

  test("monarch is primary mode", () => {
    expect(SHADOW_AGENTS.monarch.mode).toBe("primary");
  });

  test("all other shadows are subagent mode", () => {
    const subagents = ["beru", "igris", "bellion", "tusk", "tank", "shadow-sovereign"];
    for (const name of subagents) {
      expect(SHADOW_AGENTS[name].mode).toBe("subagent");
    }
  });

  test("beru and bellion have edit denied", () => {
    expect(SHADOW_AGENTS.beru.permission?.edit).toBe("deny");
    expect(SHADOW_AGENTS.bellion.permission?.edit).toBe("deny");
  });

  test("shadow-sovereign has high reasoning effort", () => {
    expect(SHADOW_AGENTS["shadow-sovereign"].options?.reasoningEffort).toBe("high");
  });

  test("all shadows have prompts", () => {
    for (const [name, agent] of Object.entries(SHADOW_AGENTS)) {
      expect(agent.prompt).toBeDefined();
      expect(agent.prompt?.length).toBeGreaterThan(50);
    }
  });
});

describe("OpenCode Overrides", () => {
  test("build has mode all", () => {
    expect(OPENCODE_OVERRIDES.build.mode).toBe("all");
  });

  test("plan has mode all", () => {
    expect(OPENCODE_OVERRIDES.plan.mode).toBe("all");
  });

  test("explore and general are hidden", () => {
    expect(OPENCODE_OVERRIDES.explore.hidden).toBe(true);
    expect(OPENCODE_OVERRIDES.general.hidden).toBe(true);
  });
});
