import { describe, expect, it } from "bun:test";

// Extract the parseJsonc function for testing
function parseJsonc(content: string): unknown {
  let result = "";
  let inString = false;
  let inSingleLineComment = false;
  let inMultiLineComment = false;
  let i = 0;
  
  while (i < content.length) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    if (inSingleLineComment) {
      if (char === "\n") {
        inSingleLineComment = false;
        result += char;
      }
      i++;
      continue;
    }
    
    if (inMultiLineComment) {
      if (char === "*" && nextChar === "/") {
        inMultiLineComment = false;
        i += 2;
        continue;
      }
      i++;
      continue;
    }
    
    if (inString) {
      result += char;
      if (char === "\\") {
        result += nextChar ?? "";
        i += 2;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      i++;
      continue;
    }
    
    if (char === '"') {
      inString = true;
      result += char;
      i++;
      continue;
    }
    
    if (char === "/" && nextChar === "/") {
      inSingleLineComment = true;
      i += 2;
      continue;
    }
    
    if (char === "/" && nextChar === "*") {
      inMultiLineComment = true;
      i += 2;
      continue;
    }
    
    result += char;
    i++;
  }
  
  result = result.replace(/,(\s*[}\]])/g, "$1");
  return JSON.parse(result);
}

describe("parseJsonc", () => {
  it("parses plain JSON", () => {
    const result = parseJsonc('{"foo": "bar"}');
    expect(result).toEqual({ foo: "bar" });
  });

  it("strips single-line comments", () => {
    const result = parseJsonc(`{
      "foo": "bar" // this is a comment
    }`);
    expect(result).toEqual({ foo: "bar" });
  });

  it("strips multi-line comments", () => {
    const result = parseJsonc(`{
      /* this is a 
         multi-line comment */
      "foo": "bar"
    }`);
    expect(result).toEqual({ foo: "bar" });
  });

  it("removes trailing commas", () => {
    const result = parseJsonc(`{
      "foo": "bar",
      "baz": [1, 2, 3,],
    }`);
    expect(result).toEqual({ foo: "bar", baz: [1, 2, 3] });
  });

  it("preserves URLs with double slashes in strings", () => {
    const result = parseJsonc(`{
      "url": "https://example.com/path"
    }`);
    expect(result).toEqual({ url: "https://example.com/path" });
  });

  it("handles escaped quotes in strings", () => {
    const result = parseJsonc(`{
      "message": "He said \\"hello\\""
    }`);
    expect(result).toEqual({ message: 'He said "hello"' });
  });

  it("parses real opencode config", () => {
    const config = `{
      // OpenCode configuration
      "theme": "dark",
      "plugin": [
        "some-plugin", // enabled
        /* "disabled-plugin", */
      ],
      "keybindings": {
        "submit": "ctrl+enter",
      }
    }`;
    const result = parseJsonc(config) as Record<string, unknown>;
    expect(result.theme).toBe("dark");
    expect(result.plugin).toEqual(["some-plugin"]);
  });
});
