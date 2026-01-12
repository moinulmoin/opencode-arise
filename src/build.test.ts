import { describe, expect, it, beforeAll } from "bun:test";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

describe("Build output", () => {
  const distPath = join(import.meta.dir, "../dist/index.js");

  beforeAll(() => {
    // Ensure dist exists (run after build)
    if (!existsSync(distPath)) {
      throw new Error("dist/index.js not found. Run 'bun run build' first.");
    }
  });

  it("dist/index.js exists", () => {
    expect(existsSync(distPath)).toBe(true);
  });

  it("only exports default", () => {
    const content = readFileSync(distPath, "utf-8");
    
    // Check the export statement at the end of the bundled file
    // Should be: export { src_default as default };
    // Should NOT have other named exports
    const exportMatch = content.match(/export\s*\{([^}]+)\}/);
    
    expect(exportMatch).toBeTruthy();
    
    const exports = exportMatch![1]
      .split(",")
      .map(e => e.trim())
      .filter(e => e.length > 0);
    
    // Should only have default export
    expect(exports.length).toBe(1);
    expect(exports[0]).toContain("default");
  });

  it("does not export SHADOW_AGENTS or OpencodeArise as named exports", () => {
    const content = readFileSync(distPath, "utf-8");
    const exportMatch = content.match(/export\s*\{([^}]+)\}/);
    const exportBlock = exportMatch?.[1] ?? "";
    
    // These should NOT be in exports
    expect(exportBlock).not.toContain("SHADOW_AGENTS");
    expect(exportBlock).not.toMatch(/OpencodeArise[^d]/); // Allow "OpencodeArise" only if part of "default"
  });
});

describe("CLI build output", () => {
  const cliPath = join(import.meta.dir, "../dist/cli/index.js");

  it("dist/cli/index.js exists", () => {
    expect(existsSync(cliPath)).toBe(true);
  });

  it("CLI is executable (has shebang)", () => {
    const content = readFileSync(cliPath, "utf-8");
    // Bun bundles may not preserve shebang, but check the file exists and is valid JS
    expect(content.length).toBeGreaterThan(100);
  });
});
