import { describe, expect, test } from "bun:test";
import { AriseConfigSchema, DEFAULT_CONFIG } from "./schema";

describe("AriseConfigSchema", () => {
  test("validates default config", () => {
    const result = AriseConfigSchema.safeParse(DEFAULT_CONFIG);
    expect(result.success).toBe(true);
  });

  test("validates empty object with defaults", () => {
    const result = AriseConfigSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.show_banner).toBe(true);
    }
  });

  test("validates config with disabled shadows", () => {
    const config = {
      disabled_shadows: ["beru", "tank"],
    };
    const result = AriseConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  test("validates config with custom output shaping", () => {
    const config = {
      output_shaping: {
        max_chars: 20000,
        preserve_errors: false,
      },
    };
    const result = AriseConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  test("rejects invalid shadow name", () => {
    const config = {
      disabled_shadows: ["invalid-shadow"],
    };
    const result = AriseConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  test("rejects invalid compaction threshold", () => {
    const config = {
      compaction: {
        threshold_percent: 150, // > 95
      },
    };
    const result = AriseConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });
});
