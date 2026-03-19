#!/usr/bin/env bun

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getBanner } from "../hooks";
import {
	PLUGIN_NAME,
	findOpencodeConfig,
	getAriseConfigPath,
	createDefaultAriseConfig,
} from "../config/paths";

function parseJsonc(content: string): unknown {
  // More robust JSONC parsing:
  // 1. Remove single-line comments (but not inside strings)
  // 2. Remove multi-line comments
  // 3. Remove trailing commas

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
        // Skip escaped character
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

    // Not in string or comment
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

  // Remove trailing commas
  result = result.replace(/,(\s*[}\]])/g, "$1");

  return JSON.parse(result);
}

function addPluginToConfig(configPath: string): boolean {
  let content: string;

  try {
    content = readFileSync(configPath, "utf-8");
  } catch (err) {
    console.error(`✗ Failed to read config file: ${configPath}`);
    console.error(`  Error: ${err instanceof Error ? err.message : err}`);
    return false;
  }

  let config: Record<string, unknown>;

  try {
    config = parseJsonc(content) as Record<string, unknown>;
  } catch (err) {
    console.error(`✗ Failed to parse config file: ${configPath}`);
    console.error(`  Error: ${err instanceof Error ? err.message : err}`);
    console.error(`\n  Your config file may have invalid JSON syntax.`);
    console.error(`  You can manually add "${PLUGIN_NAME}" to the "plugin" array.`);
    return false;
  }

  try {
    if (!config.plugin) {
      config.plugin = [];
    }

    const plugins = config.plugin as string[];
    if (plugins.includes(PLUGIN_NAME)) {
      console.log(`✓ ${PLUGIN_NAME} already registered in OpenCode config`);
      return true;
    }

    plugins.push(PLUGIN_NAME);

    const newContent = JSON.stringify(config, null, 2);
    writeFileSync(configPath, newContent, "utf-8");

    console.log(`✓ Added ${PLUGIN_NAME} to ${configPath}`);
    return true;
  } catch (err) {
    console.error(`✗ Failed to update config:`, err);
    return false;
  }
}

function createDefaultAriseConfigHandler(): void {
	const configPath = getAriseConfigPath();
	const success = createDefaultAriseConfig(configPath);

	if (success) {
		console.log(`✓ Created default config at ${configPath}`);
	} else {
    console.log(`✓ opencode-arise.json already exists at ${configPath}`);
	}
}

function install(): void {
  console.log(getBanner());
  console.log("\n🌑 Installing opencode-arise...\n");

  const configPath = findOpencodeConfig();
  if (!configPath) {
    console.error("✗ OpenCode config not found. Is OpenCode installed?");
    console.error("  Expected: ~/.config/opencode/opencode.json");
    process.exit(1);
  }

  // TypeScript narrowing: configPath is guaranteed to be string here after check
  const success = addPluginToConfig(configPath!);
  if (!success) {
    process.exit(1);
  }

  createDefaultAriseConfigHandler();

  console.log("\n⚔️  Installation complete!");
  console.log("\n  The Shadow Army awaits. Run 'opencode' to begin.\n");
  console.log("  Shadows available:");
  console.log("    @beru      - Fast codebase scout (Ant King)");
  console.log("    @igris     - Precise implementation (Loyal Knight)");
  console.log("    @bellion   - Strategic planning (Grand Marshal)");
  console.log("    @tusk      - UI/UX specialist");
  console.log("    @tank      - External research");
  console.log("    @shadow-sovereign - Deep reasoning (Full Power)");
  console.log("");
}

function doctor(): void {
  console.log("🔍 Checking opencode-arise installation...\n");

  const configPath = findOpencodeConfig();
  if (!configPath) {
    console.log(`✗ OpenCode config not found: ${configPath}`);
    // process.exit(1);
  }
  else
  {
    console.log(`✓ OpenCode config: ${configPath}`);

    try
    {
      const content = readFileSync(configPath, "utf-8");
      const config = parseJsonc(content) as Record<string, unknown>;
      const plugins = (config.plugin as string[]) ?? [];

      if (plugins.includes(PLUGIN_NAME))
      {
        console.log(`✓ ${PLUGIN_NAME} is registered`);
      } else
      {
        console.log(`✗ ${PLUGIN_NAME} is NOT registered`);
        console.log(`  Run: bunx ${PLUGIN_NAME} install`);
      }
    } catch (err)
    {
      console.log(`✗ Failed to read config:`, err instanceof Error ? err.message : err);
    }
  }

  const ariseConfigPath = getAriseConfigPath();
  if (existsSync(ariseConfigPath)) {
    console.log(`✓ opencode-arise.json exists: ${ariseConfigPath}`);
  } else {
    console.log(`○ opencode-arise.json not found (optional): ${ariseConfigPath}`);
  }

  console.log("\n✅ Doctor check complete");
}

function showHelp(): void {
  console.log(`
${getBanner()}
Usage: opencode-arise <command>

Commands:
  install   Register plugin with OpenCode and create default config
  doctor    Check installation status
  help      Show this help message

Examples:
  bunx opencode-arise install
  npx opencode-arise install
`);
}

// Main
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case "install":
    install();
    break;
  case "doctor":
    doctor();
    break;
  case "help":
  case "--help":
  case "-h":
    showHelp();
    break;
  default:
    if (command) {
      console.error(`Unknown command: ${command}`);
    }
    showHelp();
    process.exit(command ? 1 : 0);
}
