# ai-agent-bootstrap

Bootstrap AI-agent-ready development environments with a single command.

Injects agent-specific context files into any project for Cline, Cursor, OpenClaw, Windsurf, and Claude Code.

## Install & Use

```bash
# Recommended quick start (no install needed)
npx ai-agent-bootstrap init

# For repeated use, install globally
npm install -g ai-agent-bootstrap
ai-bootstrap init
```

> **Note for npm users:** the npm package page may show a generic `npm i ai-agent-bootstrap` install snippet. This package is a CLI tool, so the intended usage is `npx ai-agent-bootstrap init` (quick start) or global install + `ai-bootstrap init`.

## What It Does

Running `ai-bootstrap init` (default `--provider cline`) creates provider-specific files and appends generated AI paths into the target `.gitignore`.

For `--provider cline`:

```
your-project/
├── memory-bank/
│   ├── projectbrief.md      # Core requirements and goals
│   ├── productContext.md     # Why the project exists, UX goals
│   ├── activeContext.md      # Current focus, recent changes, next steps
│   ├── systemPatterns.md     # Architecture decisions, design patterns
│   ├── techContext.md        # Tech stack, setup, dependencies
│   └── progress.md           # What works, what's left, known issues
├── .clinerules/
│   ├── 00-memory-bank.md     # Memory bank rules
│   ├── 01-coding-standards.md # Code style and conventions
│   ├── 02-workflow.md        # Plan-first development workflow
│   ├── 03-boundaries.md     # Hard limits for the AI agent
│   └── workflows/
│      ├── plan.md
│      ├── review.md
│      └── ...
└── .clineignore              # Files the agent should ignore
```

## Commands

### `ai-bootstrap init`

Interactive setup — asks about your project and pre-fills templates.

```bash
ai-bootstrap init              # Interactive mode
ai-bootstrap init -y           # Skip prompts, use defaults
ai-bootstrap init -d ./myapp   # Target a specific directory
ai-bootstrap init -p cline       # Cline templates
ai-bootstrap init -p cursor      # Cursor templates
ai-bootstrap init -p openclaw    # OpenClaw templates
ai-bootstrap init -p windsurf    # Windsurf templates
ai-bootstrap init -p claude-code # Claude Code templates
```

### `ai-bootstrap status`

Check which AI agent files exist in your project.

```bash
ai-bootstrap status
ai-bootstrap status -p cline
ai-bootstrap status -p cursor
ai-bootstrap status -p claude-code
```

## Template Structure (Provider-Based)

The internal template source tree is organized by provider:

```
templates/
├── claude-code/
├── cline/
│   ├── .clinerules/
│   ├── memory-bank/
│   └── .clineignore
├── cursor/
│   └── .cursor/rules/*.mdc
├── openclaw/
└── windsurf/
```

Memory context is generated under:

- `memory-bank/` for `cline`, `cursor`, `openclaw`, and `windsurf`
- `docs/context/` for `claude-code`

## Why?

AI coding agents work best when they have context. Without it, they guess — wrong file structure, wrong patterns, wrong decisions.

This tool gives your agent:

- **Memory** — persistent context across sessions via memory-bank
- **Standards** — coding conventions it must follow
- **Workflow** — a plan-first approach to every task
- **Boundaries** — hard limits it can't cross without your approval

Set it up once. Every session starts informed.

## Safe to Re-run

Already have some files? No problem — `init` skips existing scaffold files and only creates what's missing.

For `.gitignore`, `init` uses a non-destructive merge: existing lines stay untouched, and only missing AI scaffold entries are appended once.

## License

MIT
