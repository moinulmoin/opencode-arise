#!/usr/bin/env bun

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getBanner } from "../hooks";

const PLUGIN_NAME = "opencode-arise";
const OPENCODE_CONFIG_PATHS = [
  join(process.env.HOME ?? "", ".config/opencode/opencode.json"),
  join(process.env.HOME ?? "", ".config/opencode/opencode.jsonc"),
];

function findOpencodeConfig(): string | null {
  for (const path of OPENCODE_CONFIG_PATHS) {
    if (existsSync(path)) return path;
  }
  return null;
}

function parseJsonc(content: string): unknown {
  // Strip comments and trailing commas
  let cleaned = content
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/,(\s*[}\]])/g, "$1");
  return JSON.parse(cleaned);
}

function addPluginToConfig(configPath: string): boolean {
  try {
    const content = readFileSync(configPath, "utf-8");
    const config = parseJsonc(content) as Record<string, unknown>;

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

function createDefaultAriseConfig(): void {
  const configDir = join(process.env.HOME ?? "", ".config/opencode");
  const configPath = join(configDir, "opencode-arise.json");

  if (existsSync(configPath)) {
    console.log(`✓ opencode-arise.json already exists`);
    return;
  }

  const defaultConfig = {
    $schema: "https://raw.githubusercontent.com/your-repo/opencode-arise/main/assets/opencode-arise.schema.json",
    show_banner: true,
    disabled_shadows: [],
    disabled_hooks: [],
  };

  try {
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }
    writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), "utf-8");
    console.log(`✓ Created default config at ${configPath}`);
  } catch (err) {
    console.error(`✗ Failed to create config:`, err);
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

  const success = addPluginToConfig(configPath);
  if (!success) {
    process.exit(1);
  }

  createDefaultAriseConfig();

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
    console.log("✗ OpenCode config not found");
    process.exit(1);
  }
  console.log(`✓ OpenCode config: ${configPath}`);

  try {
    const content = readFileSync(configPath, "utf-8");
    const config = parseJsonc(content) as Record<string, unknown>;
    const plugins = (config.plugin as string[]) ?? [];

    if (plugins.includes(PLUGIN_NAME)) {
      console.log(`✓ ${PLUGIN_NAME} is registered`);
    } else {
      console.log(`✗ ${PLUGIN_NAME} is NOT registered`);
      console.log(`  Run: bunx ${PLUGIN_NAME} install`);
    }
  } catch (err) {
    console.log(`✗ Failed to read config:`, err);
  }

  const ariseConfigPath = join(process.env.HOME ?? "", ".config/opencode/opencode-arise.json");
  if (existsSync(ariseConfigPath)) {
    console.log(`✓ opencode-arise.json exists`);
  } else {
    console.log(`○ opencode-arise.json not found (optional)`);
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
