# opencode-arise

> ⚔️ **ARISE!** A Solo Leveling themed orchestrator harness for OpenCode

A lightweight, token-efficient orchestrator layer that extends OpenCode with a shadow army of specialized AI agents.

## Installation

```bash
bunx opencode-arise install
```

This adds `opencode-arise` to your OpenCode plugins and creates a default config.

## Shadow Army

| Shadow | Role | Best For |
|--------|------|----------|
| **monarch** | Shadow Monarch (Primary) | Orchestration, delegation |
| **beru** | Ant King Scout | Fast codebase exploration, grep, file discovery |
| **igris** | Loyal Knight | Precise implementation, code changes |
| **bellion** | Grand Marshal | Strategic planning, architecture analysis |
| **tusk** | Creative Shadow | UI/UX, frontend, styling |
| **tank** | Research Shadow | External docs, web search, examples |
| **shadow-sovereign** | Full Power | Deep reasoning, complex debugging |

## Tools

The monarch has access to these tools for shadow delegation:

- `arise_summon` - Invoke a shadow synchronously or in background
- `arise_background` - Launch shadow as parallel background task
- `arise_background_output` - Get result from background task
- `arise_background_status` - List all background tasks
- `arise_background_cancel` - Cancel a running background task

## Hooks

| Hook | Description |
|------|-------------|
| `arise-banner` | Shows "ARISE!" toast on session start |
| `output-shaper` | Quality-safe output truncation (never loses errors) |
| `compaction-preserver` | Preserves critical context during compaction |
| `todo-enforcer` | Reminds about incomplete TODOs on session idle |

## Configuration

Create `~/.config/opencode/opencode-arise.json` or `.opencode/opencode-arise.json`:

```json
{
  "show_banner": true,
  "output_shaping": {
    "max_length": 8000,
    "preserve_head": 500,
    "preserve_tail": 3000
  },
  "compaction": {
    "preserve_threshold": 3
  },
  "disabled_hooks": [],
  "disabled_shadows": [],
  "agents": {
    "monarch": {
      "model": "opencode/opus-4.5"
    },
    "beru": {
      "model": "opencode/glm-4.7"
    }
  }
}
```

## Philosophy

- **Minimal sufficient delegation** - Don't over-delegate, handle trivial tasks directly
- **Parallel exploration** - Use background tasks for concurrent scouting
- **Quality-safe truncation** - Never lose errors, tracebacks, or critical output
- **Token efficiency** - Lean prompts, smart delegation

## License

MIT
