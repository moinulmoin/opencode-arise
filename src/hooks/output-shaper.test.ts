import { describe, expect, test } from "bun:test";
import { createOutputShaperHook } from "./output-shaper";
import { DEFAULT_CONFIG } from "../config/schema";

describe("OutputShaperHook", () => {
  const shaper = createOutputShaperHook(DEFAULT_CONFIG);

  test("does not truncate short output", async () => {
    const output = "Hello, world!";
    const result = await shaper.shapeOutput("test", output);
    expect(result).toBe(output);
  });

  test("truncates long output", async () => {
    const longOutput = "x".repeat(20000);
    const result = await shaper.shapeOutput("grep", longOutput);
    expect(result.length).toBeLessThan(longOutput.length);
    expect(result).toContain("[opencode-arise] Output truncated");
  });

  test("preserves error output with non-zero exit code", async () => {
    const errorOutput = "x".repeat(20000);
    const result = await shaper.shapeOutput("bash", errorOutput, { exitCode: 1 });
    expect(result).toBe(errorOutput);
  });

  test("preserves output with error patterns", async () => {
    const errorOutput = "Error: something went wrong\n" + "x".repeat(15000);
    const result = await shaper.shapeOutput("bash", errorOutput, { exitCode: 0 });
    // Should still preserve because it contains error pattern and is < 2x max
    expect(result).toBe(errorOutput);
  });
});
