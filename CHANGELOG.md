# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2025-01-12

### Fixed

- CLI installer now handles complex JSONC config files with URLs, escaped quotes, and multi-line comments
- Better error messages when config parsing fails

## [0.1.0] - 2025-01-11

### Added

- Initial release of opencode-arise
- Shadow Army agents:
  - `monarch` - Primary orchestrator (Sung Jinwoo)
  - `beru` - Fast codebase scout (Ant King)
  - `igris` - Precise implementation (Loyal Knight)
  - `bellion` - Strategic planning (Grand Marshal)
  - `tusk` - UI/UX specialist
  - `tank` - External research
  - `shadow-sovereign` - Deep reasoning (Full Power)
- Custom tools for shadow delegation:
  - `arise_summon` - Invoke shadows sync/async
  - `arise_background` - Launch parallel background tasks
  - `arise_background_output` - Get background task results
  - `arise_background_status` - List background tasks
  - `arise_background_cancel` - Cancel running tasks
- Hooks:
  - `arise-banner` - Session start toast
  - `output-shaper` - Quality-safe output truncation
  - `compaction-preserver` - Preserve critical context
  - `todo-enforcer` - Incomplete TODO reminders
- CLI installer (`bunx opencode-arise install`)
- Configuration system with project/global config support
