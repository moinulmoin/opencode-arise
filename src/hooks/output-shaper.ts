import type { AriseConfig } from "../config/schema";

const DEFAULT_MAX_CHARS = 12000;
const HEAD_RATIO = 0.7;
const TAIL_RATIO = 0.2;

export function createOutputShaperHook(config: AriseConfig) {
  const maxChars = config.output_shaping?.max_chars ?? DEFAULT_MAX_CHARS;
  const preserveErrors = config.output_shaping?.preserve_errors ?? true;
  const headChars = Math.floor(maxChars * HEAD_RATIO);
  const tailChars = Math.floor(maxChars * TAIL_RATIO);

  return {
    async shapeOutput(
      toolName: string,
      output: string,
      metadata?: Record<string, unknown>
    ): Promise<string> {
      if (typeof output !== "string") return output;
      if (output.length <= maxChars) return output;

      // Never truncate error outputs
      if (preserveErrors) {
        const exitCode = metadata?.exitCode ?? metadata?.code ?? metadata?.status;
        if (typeof exitCode === "number" && exitCode !== 0) {
          return output;
        }

        // Check for error patterns in output
        const errorPatterns = [
          /error:/i,
          /exception:/i,
          /failed:/i,
          /traceback/i,
          /stack trace/i,
          /ENOENT/,
          /EACCES/,
          /TypeError/,
          /ReferenceError/,
          /SyntaxError/,
        ];
        if (errorPatterns.some((p) => p.test(output))) {
          // Still truncate but keep more
          if (output.length <= maxChars * 2) return output;
        }
      }

      const head = output.slice(0, headChars);
      const tail = output.slice(-tailChars);
      const truncatedChars = output.length - headChars - tailChars;

      return `${head}

[opencode-arise] Output truncated (${output.length.toLocaleString()} chars, ${truncatedChars.toLocaleString()} removed).
Use a more specific query or read a targeted file section if needed.

${tail}`;
    },
  };
}
