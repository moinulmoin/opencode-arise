import { describe, expect, it } from "bun:test";
import { createAriseBannerHook, getBanner } from "./arise-banner";
import { createCompactionPreserverHook } from "./compaction-preserver";
import { createTodoEnforcerHook } from "./todo-enforcer";

const mockCtx = {
  client: {
    tui: {
      showToast: async () => {},
    },
    session: {
      messages: async () => ({ data: [] }),
    },
  },
} as any;

describe("arise-banner hook", () => {
  it("getBanner returns ASCII art", () => {
    const banner = getBanner();
    
    expect(banner).toContain("A R I S E"); // Spaced out in banner
    expect(banner).toContain("Shadow Army");
    expect(banner).toContain("Monarch");
  });

  it("creates hook with onSessionCreated", () => {
    const hook = createAriseBannerHook(mockCtx);
    
    expect(hook).toBeDefined();
    expect(hook.onSessionCreated).toBeDefined();
    expect(typeof hook.onSessionCreated).toBe("function");
  });
});

describe("compaction-preserver hook", () => {
  it("creates hook with getPreservationContext", () => {
    const hook = createCompactionPreserverHook();
    
    expect(hook).toBeDefined();
    expect(hook.getPreservationContext).toBeDefined();
    expect(typeof hook.getPreservationContext).toBe("function");
  });

  it("returns context with preservation rules", () => {
    const hook = createCompactionPreserverHook();
    const context = hook.getPreservationContext();
    
    expect(context).toContain("PRESERVE");
    expect(context).toContain("TODO");
    expect(context).toContain("PRUNE");
  });
});

describe("todo-enforcer hook", () => {
  it("creates hook with checkCompletion", () => {
    const hook = createTodoEnforcerHook(mockCtx);
    
    expect(hook).toBeDefined();
    expect(hook.checkCompletion).toBeDefined();
    expect(typeof hook.checkCompletion).toBe("function");
  });

  it("detects pending todos", async () => {
    const hook = createTodoEnforcerHook(mockCtx);
    
    const result = await hook.checkCompletion([
      { content: "1. [pending] Fix the bug" },
      { content: "2. [completed] Write tests" },
    ]);
    
    expect(result.hasIncompleteTodos).toBe(true);
  });

  it("detects in_progress todos", async () => {
    const hook = createTodoEnforcerHook(mockCtx);
    
    const result = await hook.checkCompletion([
      { content: "1. [in_progress] Working on feature" },
    ]);
    
    expect(result.hasIncompleteTodos).toBe(true);
  });

  it("returns false when all complete", async () => {
    const hook = createTodoEnforcerHook(mockCtx);
    
    const result = await hook.checkCompletion([
      { content: "1. [completed] Done" },
      { content: "2. [completed] Also done" },
    ]);
    
    expect(result.hasIncompleteTodos).toBe(false);
  });

  it("returns false when no todos", async () => {
    const hook = createTodoEnforcerHook(mockCtx);
    
    const result = await hook.checkCompletion([
      { content: "Just some regular text without todos" },
    ]);
    
    expect(result.hasIncompleteTodos).toBe(false);
  });

  it("detects markdown checkbox todos", async () => {
    const hook = createTodoEnforcerHook(mockCtx);
    
    const result = await hook.checkCompletion([
      { content: "- [ ] Unchecked item" },
    ]);
    
    expect(result.hasIncompleteTodos).toBe(true);
  });
});
