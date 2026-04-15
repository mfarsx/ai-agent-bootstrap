# ai-agent-bootstrap

Bootstrap AI-agent-ready project context with a single command.

`ai-agent-bootstrap` injects provider-specific context and rules into any project for Cline, Cursor, OpenClaw, Windsurf, and Claude Code.

## Quick Start (30 Seconds)

```bash
# Recommended (no install needed)
npx ai-agent-bootstrap init
```

For repeated local usage:

```bash
npm install -g ai-agent-bootstrap
ai-bootstrap init
```

## Safe by Default

- `init` never overwrites existing scaffold files (skip-existing by design).
- `.gitignore` is merged non-destructively: only missing AI scaffold entries are appended once.

## What You Get

Running `ai-bootstrap init` (default `--provider cline`) creates provider-specific AI context files and updates `.gitignore`.

Typical generated structure for `--provider cline`:

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
└── .clineignore
```

## Choose Your Provider

Use `-p, --provider <name>` with one of the following:

| Provider | Best for | Context path | Rules / key files |
| --- | --- | --- | --- |
| `cline` | Cline setup | `memory-bank/` | `.clinerules/`, `.clineignore` |
| `cursor` | Cursor setup | `memory-bank/` | `.cursor/rules/`, `AGENTS.md`, `.cursor/index.mdc` |
| `openclaw` | OpenClaw setup | `memory-bank/` | `AGENTS.md`, `IDENTITY.md`, `SOUL.md`, `USER.md` |
| `windsurf` | Windsurf setup | `memory-bank/` | `.windsurf/rules/`, `AGENTS.md` |
| `claude-code` | Claude Code setup | `docs/context/` | `CLAUDE.md`, `AGENTS.md`, `.claude/commands/update-memory.md` |

## CLI Reference

### Common Commands

```bash
ai-bootstrap init            # Interactive mode
ai-bootstrap init -y         # Skip prompts, use defaults
ai-bootstrap init -d ./myapp # Target directory
ai-bootstrap status          # Check generated files
```

### Select a Provider

```bash
ai-bootstrap init -p cline
ai-bootstrap init -p cursor
ai-bootstrap init -p openclaw
ai-bootstrap init -p windsurf
ai-bootstrap init -p claude-code
```

```bash
ai-bootstrap status -p cline
ai-bootstrap status -p cursor
ai-bootstrap status -p claude-code
```

### Advanced Inputs (`--config`, `--var`)

```bash
ai-bootstrap init --config ./bootstrap.config.json
ai-bootstrap init --var OWNER_NAME=platform-team
ai-bootstrap init --var OWNER_NAME=platform --var BUILD_COMMAND="npm run build"
ai-bootstrap init --config ./bootstrap.config.json --var OWNER_NAME=cli-override
```

Input precedence:

- context: defaults < prompt < config < CLI overrides
- template variables: defaults < config.templateVariables < `--var`

Config format (`--config`):

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

`templateVariables` may also be an array of `KEY=VALUE` entries:

```json
{
  "templateVariables": [
    "OWNER_NAME=platform-team",
    "BUILD_COMMAND=npm run build"
  ]
}
```

If config loading fails, the CLI reports `config error: ...` with a specific message.

## Template Structure (Provider-Based)

Internal template sources:

```text
templates/
├── claude-code/
├── cline/
│   ├── .clinerules/
│   └── .clineignore
├── cursor/
│   └── .cursor/rules/*.mdc
├── openclaw/
├── shared/
│   └── memory-bank/
└── windsurf/
```

## Why This Exists

AI coding agents are much more reliable when they get explicit project memory, standards, workflow, and boundaries from day one.

This tool gives your agent:

- **Memory**: persistent project context across sessions
- **Standards**: coding rules and conventions
- **Workflow**: plan-first execution guidance
- **Boundaries**: hard limits requiring human approval

Set it up once, then start every session with context.

## License

MIT
