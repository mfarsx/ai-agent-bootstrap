# ai-agent-bootstrap

[![npm version](https://img.shields.io/npm/v/ai-agent-bootstrap)](https://www.npmjs.com/package/ai-agent-bootstrap)
[![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![license](https://img.shields.io/npm/l/ai-agent-bootstrap)](./LICENSE)

Set up AI-agent project context in minutes, not hours.

`ai-agent-bootstrap` scaffolds memory, rules, workflows, and boundaries for Cline, Cursor, OpenClaw, Windsurf, and Claude Code.

## Start In 10 Seconds

```bash
npx ai-agent-bootstrap init
```

No install required. Answer a few prompts and your project is agent-ready.

For repeated use:

```bash
npm install -g ai-agent-bootstrap
ai-agent-bootstrap init
```

## 30-Second Demo

![ai-agent-bootstrap init demo](docs/assets/readme/demo-init-fast.gif)

- Runs from an existing project folder.
- Creates provider-specific context files.
- Prints next steps so you can start the agent immediately.

## Why Teams Use This

- Fast onboarding for new and existing repos.
- Consistent AI behavior through shared rules and memory files.
- Safer defaults that avoid destructive overwrites during `init`.

## What's New In 1.3.0

- `init` now exits early when a directory is already fully initialized.
- Partial re-runs now auto-fill only missing files instead of re-prompting.
- Added `init --force` to intentionally bypass early-exit behavior.
- Added `init --verbose` to show full skip details when needed.
- When provider is omitted and existing provider files are detected, `init` now prints actionable **modify/install** commands per provider instead of silently choosing one.

## Previous Highlights

### 1.2.0

- Replaced `inquirer` with `prompts` to reduce dependency surface.
- Replaced `fs-extra` with a native `node:fs/promises` helper module.
- Reduced transitive dependency footprint after lockfile regeneration.
- Smaller install footprint: top-level dependencies are now just `chalk`, `commander`, `diff`, and `prompts`.
- Added `CHANGELOG.md` for clearer release notes going forward.

### 1.1.6

- Renamed the CLI executable to `ai-agent-bootstrap` for consistent package/command naming.
- Updated command examples to use `ai-agent-bootstrap` across global and `npx` usage.
- Clarified docs around local repo execution vs npm package execution to reduce Windows command resolution confusion.

### 1.1.5

- Parity across providers: Cursor skills, Windsurf workflows, and Claude Code commands all cover the same 9 flows (`plan`, `review`, `commit`, `init-memory`, `update-memory`, `checkpoint`, `status`, `cleanup`, `stuck`).
- New ignore files shipped with templates: `.cursorignore`, `.windsurfignore`, plus an expanded `.clineignore` baseline.
- Cline gains its own `AGENTS.md` for a consistent overview across providers.
- Stack-aware defaults: `init` now picks a sensible `projectStructure` and install/test/lint commands based on the chosen stack (Node.js, React, Python, Go, etc.).
- Cursor rule posture cleaned up: `00-memory-bank` and `03-boundaries` stay always-on; `01-coding-standards` and `02-workflow` become agent-requestable to cut context bloat. `.cursor/index.mdc` is now a real map of rules, skills, and context.
- Bug fixes across `AGENTS.md` and `03-boundaries.*`: removed hardcoded TypeScript and `public/` assumptions; corrected Claude Code's context path reference.

## What Gets Generated

For `cline` (default), `init` scaffolds files like:

```text
your-project/
├── memory-bank/
│   ├── projectbrief.md
│   ├── productContext.md
│   ├── activeContext.md
│   ├── systemPatterns.md
│   ├── techContext.md
│   └── progress.md
├── AGENTS.md
├── .clinerules/
│   ├── 00-memory-bank.md
│   ├── 01-coding-standards.md
│   ├── 02-workflow.md
│   ├── 03-boundaries.md
│   └── workflows/
│       ├── plan.md
│       ├── review.md
│       ├── commit.md
│       ├── init-memory.md
│       ├── update-memory.md
│       ├── checkpoint.md
│       ├── status.md
│       ├── cleanup.md
│       └── stuck.md
└── .clineignore
```

Other providers follow the same shape under their own directories (`.cursor/`, `.windsurf/`, `.claude/`, `docs/context/`).

Provider summary:

- `cline`: `memory-bank/`, `AGENTS.md`, `.clinerules/` (rules + 9 workflows), `.clineignore`
- `cursor`: `memory-bank/`, `AGENTS.md`, `.cursor/index.mdc`, `.cursor/rules/`, `.cursor/skills/` (9 skills), `.cursorignore`
- `openclaw`: `memory-bank/`, `AGENTS.md`, `IDENTITY.md`, `SOUL.md`, `USER.md`
- `windsurf`: `memory-bank/`, `AGENTS.md`, `.windsurf/rules/`, `.windsurf/workflows/` (9 workflows), `.windsurfignore`
- `claude-code`: `docs/context/`, `AGENTS.md`, `CLAUDE.md`, `.claude/commands/` (9 commands)

## After `init`: First Success Path

- Fresh install:
  - Cline: run `/init-memory`
  - Cursor: run `/init-memory` in chat (triggers the `init-memory` skill in `.cursor/skills/`)
  - Windsurf: run `/init-memory` in Windsurf chat (uses `.windsurf/workflows/init-memory.md`)
  - Claude Code: run `/init-memory` in Claude Code (uses `.claude/commands/init-memory.md`)
- Existing project re-run:
  - Cline / Cursor / Windsurf / Claude Code: run `/update-memory` in the agent chat
- OpenClaw: fill and maintain generated context files manually.

> Cursor uses Agent Skills (folder-based `SKILL.md` files) instead of the legacy `@workflow` commands. Skills live under `.cursor/skills/<slug>/SKILL.md` and are invoked via `/<slug>` in chat.

## Commands

### `init`

Scaffold AI files into a project.

```bash
ai-agent-bootstrap init
ai-agent-bootstrap init -y
ai-agent-bootstrap init -p cursor
ai-agent-bootstrap init -d ./myapp
ai-agent-bootstrap init --dry-run
ai-agent-bootstrap init --force
ai-agent-bootstrap init --verbose
ai-agent-bootstrap init --config ./bootstrap.config.json
```

#### How `init` behaves on re-runs

- **Fresh directory**: normal init flow (prompts unless `-y`).
- **Partially initialized directory**: `init` auto-completes missing files with defaults/config, without re-prompting.
- **Fully initialized directory**: `init` exits early with guidance to `status`, `reset`, or `init --force`.
- **Provider omitted + existing provider footprints**: `init` prints provider actions (for example, `init -p cursor --force` to modify Cursor or `init -p windsurf` to install Windsurf) and exits without making assumptions.

Use `--force` when you explicitly want the legacy re-run behavior (re-prompt + skip-existing pass).

Use `--verbose` to print every skipped file (default output now summarizes skip counts).

### `status`

Check which expected files exist.

```bash
ai-agent-bootstrap status
ai-agent-bootstrap status -p cursor
ai-agent-bootstrap status -d ./myapp
```

### `reset`

Re-render provider files from templates. Shows a diff and confirms before writing.

```bash
ai-agent-bootstrap reset
ai-agent-bootstrap reset --dry-run
ai-agent-bootstrap reset -y
ai-agent-bootstrap reset -p cursor
ai-agent-bootstrap reset --config ./bootstrap.config.json
ai-agent-bootstrap reset --prompt
```

`reset` is non-interactive by default — it re-renders from templates using project defaults (plus any `--config` values). Pass `--prompt` to re-answer the project questions before resetting.

## Config File

Use `bootstrap.config.json` for repeatable, non-interactive setup across repos and environments.

### How config is discovered

- `init` and `reset` support `--config <path>`.
- If `--config` is omitted, the CLI auto-discovers `bootstrap.config.json` in the target directory.
- `status` does not use config input.

```bash
ai-agent-bootstrap init --config ./bootstrap.config.json
ai-agent-bootstrap reset --config ./bootstrap.config.json
```

### Canonical shape

Recommended structure:

```json
{
  "context": {},
  "templateVariables": {}
}
```

Validation/compatibility notes:

- The root value must be a JSON object.
- `context` must be an object.
- `templateVariables` can be either:
  - an object (recommended)
  - an array of `KEY=value` strings (compatibility format)
- `variables` is also accepted as a compatibility alias for `templateVariables`.

### Canonical `context` fields

Commonly used fields:

- `provider`
- `projectName`
- `projectDescription`
- `stack`
- `extras`
- `targetAudience`
- `installCommand`
- `devCommand`
- `testCommand`
- `lintCommand`
- `projectStructure`
- `planWorkflowGuidance`
- `reviewWorkflowGuidance`
- `commitWorkflowGuidance`

Common provider values: `cline`, `cursor`, `openclaw`, `windsurf`, `claude-code`.

Common stack values: `Node.js`, `React`, `Next.js`, `Vue`, `Python`, `TypeScript`, `Go`, `Other`.

Custom stack values (for example `"Rust"`) are also allowed.

### Precedence and stack-derived defaults

Context precedence:

`defaults < prompt answers < config file`

`stack` influences default values for:

- `installCommand`
- `devCommand`
- `testCommand`
- `lintCommand`
- `projectStructure`

> If you use `stack: "Other"` (or a custom stack), command defaults may fall back to generic placeholder values. Set command fields explicitly in config for production-ready output.

### Example 1: minimal config

```json
{
  "context": {
    "provider": "cursor",
    "stack": "TypeScript",
    "projectName": "my-project"
  }
}
```

### Example 2: custom stack with explicit commands

```json
{
  "context": {
    "provider": "cline",
    "stack": "Rust",
    "projectName": "rust-service",
    "projectDescription": "Backend API service",
    "targetAudience": "Internal platform engineers",
    "installCommand": "cargo fetch",
    "devCommand": "cargo run",
    "testCommand": "cargo test",
    "lintCommand": "cargo clippy --all-targets --all-features",
    "projectStructure": "src/\n  ├── main.rs\n  └── ..."
  }
}
```

### Example 3: template variables (recommended + compatibility)

Recommended object format:

```json
{
  "context": {
    "provider": "windsurf",
    "stack": "Node.js",
    "projectName": "team-app"
  },
  "templateVariables": {
    "OWNER_NAME": "platform-team",
    "ONCALL_CHANNEL": "#team-oncall"
  }
}
```

Compatibility array format:

```json
{
  "templateVariables": [
    "OWNER_NAME=platform-team",
    "ONCALL_CHANNEL=#team-oncall"
  ]
}
```

> `templateVariables` can override built-in template tokens. Prefer custom keys for normal usage, and only override built-ins intentionally.

## Safe By Default

- `init` skips existing files (non-destructive).
- `init` exits early when nothing needs to change.
- `reset` prints a diff before writing changes.
- `.gitignore` entries are merged by appending only missing lines.

## FAQ

### Will this overwrite my existing files?

`init` will not. It skips files that already exist.

If everything is already initialized, `init` exits early. Use `init --force` to re-run prompt flow intentionally.

### Can I preview changes first?

Yes. Use `--dry-run` with `init` or `reset`.

### Can I use this on an existing project?

Yes. It is designed for both new and active repositories.

## Start Now

Run:

```bash
npx --yes ai-agent-bootstrap init
```

If you are inside this repository and testing locally, use:

```bash
node bin/cli.js init
# or
npm run init
```

If this saves your team time, open an issue or PR to help improve provider templates.

## License

MIT
