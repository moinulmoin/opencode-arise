import { describe, expect, it } from "bun:test";

describe("Plugin exports", () => {
  it("only exports default (plugin function)", async () => {
    // Dynamic import to get all exports
    const module = await import("./index");
    const exportNames = Object.keys(module);
    
    // For npm packages, OpenCode calls ALL exports as plugin functions
    // So we must ONLY have 'default' export
    expect(exportNames).toEqual(["default"]);
  });

  it("default export is an async function", async () => {
    const module = await import("./index");
    expect(typeof module.default).toBe("function");
  });

  it("plugin function returns hooks object when called", async () => {
    const module = await import("./index");
    
    // Mock the plugin context
    const mockCtx = {
      client: {
        session: { create: async () => ({ data: { id: "test" } }) },
        tui: { showToast: async () => {} },
      },
      project: { id: "test", worktree: "/tmp" },
      directory: "/tmp",
      worktree: "/tmp",
      serverUrl: new URL("http://localhost:4096"),
      $: {} as any,
    };

    const hooks = await module.default(mockCtx as any);
    
    // Verify it returns a hooks object with expected properties
    expect(hooks).toBeDefined();
    expect(typeof hooks).toBe("object");
    expect(hooks.tool).toBeDefined(); // Our custom tools
    expect(hooks.config).toBeDefined(); // Config hook
    expect(hooks.event).toBeDefined(); // Event hook
  });
});
