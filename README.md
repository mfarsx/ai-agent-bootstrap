# ai-agent-bootstrap

Bootstrap AI-agent-ready project context with a single command.

Scaffolds provider-specific memory, rules, workflows, and boundaries for **Cline**, **Cursor**, **OpenClaw**, **Windsurf**, and **Claude Code**.

## Quick Start

```bash
npx ai-agent-bootstrap init
```

That's it. No install needed. The CLI asks a few questions and generates everything.

For repeated use:

```bash
npm install -g ai-agent-bootstrap
ai-bootstrap init
```

## What You Get

Running `ai-bootstrap init` creates provider-specific AI context files and updates `.gitignore`.

For `--provider cline` (default):

```text
your-project/
├── memory-bank/
│   ├── projectbrief.md
│   ├── productContext.md
│   ├── activeContext.md
│   ├── systemPatterns.md
│   ├── techContext.md
│   └── progress.md
├── .clinerules/
│   ├── 00-memory-bank.md
│   ├── 01-coding-standards.md
│   ├── 02-workflow.md
│   ├── 03-boundaries.md
│   └── workflows/
│       ├── init-memory.md
│       ├── update-memory.md
│       ├── plan.md
│       ├── review.md
│       ├── commit.md
│       └── ...
└── .clineignore
```

After init, the CLI tells you what to do next based on your provider:

- **Fresh install** &rarr; run `/init-memory` (Cline) or `@init-memory` (Cursor) to populate memory-bank
- **Re-run with existing files** &rarr; run `/update-memory` or `@update-memory` to sync

## Providers

| Provider | Context path | Key files | Memory workflow |
| --- | --- | --- | --- |
| `cline` | `memory-bank/` | `.clinerules/`, `.clineignore` | `/init-memory`, `/update-memory` |
| `cursor` | `memory-bank/` | `.cursor/rules/`, `AGENTS.md` | `@init-memory`, `@update-memory` |
| `openclaw` | `memory-bank/` | `AGENTS.md`, `IDENTITY.md`, `SOUL.md`, `USER.md` | manual |
| `windsurf` | `memory-bank/` | `.windsurf/rules/`, `AGENTS.md` | manual |
| `claude-code` | `docs/context/` | `CLAUDE.md`, `AGENTS.md` | `/update-memory` |

## Commands

### `init`

Scaffold AI agent files into a project.

```bash
ai-bootstrap init                  # Interactive
ai-bootstrap init -y               # Skip prompts, use defaults
ai-bootstrap init -p cursor        # Use a specific provider
ai-bootstrap init -d ./myapp       # Target a different directory
ai-bootstrap init --dry-run        # Preview without writing
```

### `status`

Check which AI agent files exist in a project.

```bash
ai-bootstrap status
ai-bootstrap status -p cursor
```

### `reset`

Re-generate scaffold files from templates. Shows a diff and asks for confirmation before overwriting.

```bash
ai-bootstrap reset                 # Interactive diff + confirm
ai-bootstrap reset --dry-run       # Preview diff only
ai-bootstrap reset -y              # Skip confirmation
ai-bootstrap reset -p cursor       # Reset a specific provider
```

### Common Options

| Option | Available on | Description |
| --- | --- | --- |
| `-p, --provider <name>` | all | Provider (cline, cursor, openclaw, windsurf, claude-code) |
| `-d, --dir <path>` | all | Target directory (default: `.`) |
| `-y, --yes` | init, reset | Skip prompts |
| `--dry-run` | init, reset | Preview changes without writing |
| `--config <path>` | init, reset | Path to JSON config file |
| `--var KEY=VALUE` | init | Template variable override (repeatable) |

## Config File

Drop a `bootstrap.config.json` in your project root (auto-discovered) or pass `--config`:

```json
{
  "context": {
    "provider": "cursor",
    "stack": "TypeScript",
    "projectName": "my-project"
  },
  "templateVariables": {
    "OWNER_NAME": "platform-team",
    "BUILD_COMMAND": "npm run build"
  }
}
```

Precedence: defaults < prompt answers < config file < `--var` CLI flags.

## Safe by Default

- `init` never overwrites existing files (skip-existing by design).
- `reset` shows a diff and asks for confirmation before writing.
- `.gitignore` is merged non-destructively: only missing entries are appended.

## Why This Exists

AI coding agents work best with explicit context. Without it, they guess wrong.

This tool gives your agent:

- **Memory** -- persistent project context across sessions
- **Standards** -- coding rules and conventions
- **Workflow** -- plan-first execution with built-in commands
- **Boundaries** -- hard limits requiring human approval

Set it up once, then start every session with context.

## License

MIT
