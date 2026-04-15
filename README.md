# ai-agent-bootstrap

Bootstrap AI-agent-ready development environments with a single command.

Injects `memory-bank/`, `.clinerules/`, and `.clineignore` into any project — giving your AI coding agent (Cline, etc.) the context it needs from day one.

## Install & Use

```bash
# Run directly (no install needed)
npx ai-agent-bootstrap init

# Or install globally
npm install -g ai-agent-bootstrap
ai-bootstrap init
```

## What It Does

Running `ai-bootstrap init` creates:

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
│   └── 03-boundaries.md     # Hard limits for the AI agent
└── .clineignore              # Files the agent should ignore
```

## Commands

### `ai-bootstrap init`

Interactive setup — asks about your project and pre-fills templates.

```bash
ai-bootstrap init              # Interactive mode
ai-bootstrap init -y           # Skip prompts, use defaults
ai-bootstrap init -d ./myapp   # Target a specific directory
```

### `ai-bootstrap status`

Check which AI agent files exist in your project.

```bash
ai-bootstrap status
```

## Why?

AI coding agents work best when they have context. Without it, they guess — wrong file structure, wrong patterns, wrong decisions.

This tool gives your agent:
- **Memory** — persistent context across sessions via memory-bank
- **Standards** — coding conventions it must follow
- **Workflow** — a plan-first approach to every task
- **Boundaries** — hard limits it can't cross without your approval

Set it up once. Every session starts informed.

## Safe to Re-run

Already have some files? No problem — `init` skips existing files and only creates what's missing.

## License

MIT
