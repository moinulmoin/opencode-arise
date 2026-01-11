# opencode-arise

> ⚔️ **ARISE!** A Solo Leveling themed orchestrator harness for OpenCode

[![npm version](https://img.shields.io/npm/v/opencode-arise.svg)](https://www.npmjs.com/package/opencode-arise)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, token-efficient orchestrator layer that extends [OpenCode](https://opencode.ai) with a shadow army of specialized AI agents. Inspired by Solo Leveling's Shadow Monarch, Sung Jinwoo.

## Features

- **Shadow Army** - 7 specialized agents for different tasks
- **Smart Delegation** - Monarch orchestrates with minimal token usage
- **Parallel Execution** - Background tasks for concurrent exploration
- **Quality-Safe Output** - Never truncates errors or stack traces
- **Configurable** - Customize models, disable shadows, tweak behavior

## Installation

```bash
bunx opencode-arise install
```

This registers the plugin with OpenCode and creates a default config.

**Verify installation:**
```bash
bunx opencode-arise doctor
```

## Quick Start

After installation, just run OpenCode as usual:

```bash
opencode
```

You'll see the "ARISE!" banner, and the **Monarch** becomes your default agent. Talk naturally - the Monarch decides when to delegate to shadows.

```
You: "Find all React components using useState and add error boundaries"

Monarch: "I'll have Beru scout the codebase, then Igris implement the changes."
```

## Shadow Army

| Shadow | Role | Best For |
|--------|------|----------|
| 👑 **monarch** | Shadow Monarch | Orchestration, delegation decisions |
| 🐜 **beru** | Ant King Scout | Fast codebase exploration, grep, file discovery |
| ⚔️ **igris** | Loyal Knight | Precise implementation, code changes |
| 🎖️ **bellion** | Grand Marshal | Strategic planning, architecture analysis |
| 🎨 **tusk** | Creative Shadow | UI/UX, frontend, styling |
| 🛡️ **tank** | Research Shadow | External docs, web search, examples |
| 👁️ **shadow-sovereign** | Full Power | Deep reasoning, complex debugging |

### Direct Summoning

You can bypass the Monarch and summon shadows directly:

```
@beru find all TODO comments in src/

@bellion plan a migration from REST to GraphQL

@shadow-sovereign why is this recursive function causing a stack overflow?
```

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                        USER                              │
│                          │                               │
│                          ▼                               │
│    ┌─────────────────────────────────────────────────┐  │
│    │                👑 MONARCH                        │  │
│    │           (Primary Orchestrator)                 │  │
│    │                                                  │  │
│    │     Assesses task → Delegates or handles        │  │
│    └──────────────────────┬──────────────────────────┘  │
│                           │                              │
│       ┌───────┬───────────┼───────────┬───────┐         │
│       ▼       ▼           ▼           ▼       ▼         │
│     🐜      ⚔️          🎖️          🛡️      👁️        │
│    BERU   IGRIS      BELLION       TANK   SOVEREIGN    │
│    scout  implement    plan       research  reason      │
└─────────────────────────────────────────────────────────┘
```

**Monarch's Principles:**
1. Assess intent before acting - don't over-delegate
2. Handle trivial tasks directly
3. Use parallel background tasks for exploration
4. Only summon shadow-sovereign for complex problems
5. Verify changes work before declaring done

## Custom Tools

The plugin provides these tools to the Monarch:

| Tool | Description |
|------|-------------|
| `arise_summon` | Invoke a shadow (sync or background) |
| `arise_background` | Launch parallel background task |
| `arise_background_output` | Get result from background task |
| `arise_background_status` | List all background tasks |
| `arise_background_cancel` | Cancel a running task |

## Hooks

| Hook | Description |
|------|-------------|
| `arise-banner` | Shows "ARISE!" toast on session start |
| `output-shaper` | Quality-safe output truncation (preserves errors) |
| `compaction-preserver` | Preserves critical context during session compaction |
| `todo-enforcer` | Reminds about incomplete TODOs on session idle |

## Configuration

Create `~/.config/opencode/opencode-arise.json`:

```json
{
  "show_banner": true,
  "disabled_shadows": [],
  "disabled_hooks": [],
  "agents": {
    "monarch": {
      "model": "anthropic/claude-sonnet-4"
    },
    "beru": {
      "model": "openai/gpt-4.1-mini"
    }
  },
  "output_shaping": {
    "max_chars": 12000,
    "preserve_errors": true
  },
  "compaction": {
    "threshold_percent": 80,
    "preserve_todos": true
  }
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `show_banner` | boolean | `true` | Show "ARISE!" toast on session start |
| `banner_every_session` | boolean | `false` | Show banner for every session (not just first) |
| `disabled_shadows` | string[] | `[]` | Shadows to disable (e.g., `["tusk", "tank"]`) |
| `disabled_hooks` | string[] | `[]` | Hooks to disable |
| `agents.<name>.model` | string | varies | Override model for a shadow |
| `agents.<name>.disabled` | boolean | `false` | Disable specific shadow |
| `output_shaping.max_chars` | number | `12000` | Max output length before truncation |
| `output_shaping.preserve_errors` | boolean | `true` | Never truncate error outputs |
| `compaction.threshold_percent` | number | `80` | Context threshold for compaction |
| `compaction.preserve_todos` | boolean | `true` | Keep TODOs during compaction |

### Project-Level Config

You can also create `.opencode/opencode-arise.json` in your project root. Project config merges with (and overrides) global config.

## Default Models

| Shadow | Default Model |
|--------|---------------|
| monarch | `opencode/opus-4.5` |
| beru | `opencode/glm-4.7` |
| igris | `opencode/glm-4.7` |
| bellion | `opencode/opus-4.5` |
| tusk | `opencode/opus-4.5` |
| tank | `opencode/glm-4.7` |
| shadow-sovereign | `openai/gpt-5.2` (high reasoning) |

## Examples

### Parallel Codebase Exploration

```
You: "I need to understand how authentication works and find security best practices"

Monarch: *launches beru (codebase) and tank (research) in background*
         "Beru is exploring the auth implementation while Tank researches 
          security best practices. I'll compile their findings."
```

### Complex Refactoring

```
You: "Refactor the payment module to use the new Stripe API"

Monarch: "This requires planning. Let me consult Bellion first."

Bellion: *analyzes codebase, creates migration plan*

Monarch: "Bellion's plan looks good. Igris will implement it step by step."

Igris: *implements changes, runs tests after each step*
```

### Deep Debugging

```
You: "This async function is causing race conditions but I can't figure out why"

Monarch: "This needs deep analysis. Summoning the Shadow Sovereign."

Shadow-Sovereign: *deep reasoning analysis*
                  "The issue is a closure capturing a stale reference..."
```

## Uninstall

Remove from OpenCode config:

```bash
# Edit ~/.config/opencode/opencode.json
# Remove "opencode-arise" from the "plugin" array
```

Or manually:
```bash
# Remove config
rm ~/.config/opencode/opencode-arise.json
```

## Requirements

- [OpenCode](https://opencode.ai) CLI installed
- [Bun](https://bun.sh) runtime (v1.0.0+)

## Philosophy

- **Minimal sufficient delegation** - Don't over-delegate simple tasks
- **Parallel exploration** - Use background tasks for concurrent scouting
- **Quality-safe truncation** - Never lose errors, tracebacks, or critical output
- **Token efficiency** - Lean prompts, smart delegation patterns

## Contributing

Contributions are welcome! Please read the contributing guidelines first.

```bash
# Clone the repo
git clone https://github.com/moinulmoin/opencode-arise.git
cd opencode-arise

# Install dependencies
bun install

# Run tests
bun test

# Build
bun run build
```

## License

[MIT](LICENSE) © moinulmoin

---

<p align="center">
  <i>"I alone level up."</i> - Sung Jinwoo
</p>
