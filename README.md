# ai-agent-bootstrap

[![npm version](https://img.shields.io/npm/v/ai-agent-bootstrap)](https://www.npmjs.com/package/ai-agent-bootstrap)
[![node](https://img.shields.io/badge/node-%3E%3D16-brightgreen)](https://nodejs.org/)
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
ai-bootstrap init
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
├── .clinerules/
│   ├── 00-memory-bank.md
│   ├── 01-coding-standards.md
│   ├── 02-workflow.md
│   ├── 03-boundaries.md
│   └── workflows/
└── .clineignore
```

Provider summary:

- `cline`: `memory-bank/`, `.clinerules/`, `.clineignore`
- `cursor`: `memory-bank/`, `.cursor/rules/`, `.cursor/skills/`, `AGENTS.md`
- `openclaw`: `memory-bank/`, `AGENTS.md`, `IDENTITY.md`, `SOUL.md`, `USER.md`
- `windsurf`: `memory-bank/`, `.windsurf/rules/`, `AGENTS.md`
- `claude-code`: `docs/context/`, `CLAUDE.md`, `AGENTS.md`

## After `init`: First Success Path

- Fresh install:
  - Cline: run `/init-memory`
  - Cursor: run `/init-memory` in chat (triggers the `init-memory` skill in `.cursor/skills/`)
- Existing project re-run:
  - Cline: run `/update-memory`
  - Cursor: run `/update-memory` in chat
- Other providers: fill and maintain generated context files manually.

> Cursor uses Agent Skills (folder-based `SKILL.md` files) instead of the legacy `@workflow` commands. Skills live under `.cursor/skills/<slug>/SKILL.md` and are invoked via `/<slug>` in chat.

## Commands

### `init`

Scaffold AI files into a project.

```bash
ai-bootstrap init
ai-bootstrap init -y
ai-bootstrap init -p cursor
ai-bootstrap init -d ./myapp
ai-bootstrap init --dry-run
ai-bootstrap init --config ./bootstrap.config.json
ai-bootstrap init --var OWNER_NAME=platform-team --var BUILD_COMMAND="npm run build"
```

### `status`

Check which expected files exist.

```bash
ai-bootstrap status
ai-bootstrap status -p cursor
ai-bootstrap status -d ./myapp
```

### `reset`

Re-render provider files from templates. Shows a diff and confirms before writing.

```bash
ai-bootstrap reset
ai-bootstrap reset --dry-run
ai-bootstrap reset -y
ai-bootstrap reset -p cursor
ai-bootstrap reset --config ./bootstrap.config.json
```

## Config File

Create `bootstrap.config.json` in your project root (auto-discovered) or pass it via `--config`:

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

Variable precedence:

`defaults < prompt answers < config file < --var flags`

## Safe By Default

- `init` skips existing files (non-destructive).
- `reset` prints a diff before writing changes.
- `.gitignore` entries are merged by appending only missing lines.

## FAQ

### Will this overwrite my existing files?

`init` will not. It skips files that already exist.

### Can I preview changes first?

Yes. Use `--dry-run` with `init` or `reset`.

### Can I use this on an existing project?

Yes. It is designed for both new and active repositories.

## Start Now

Run:

```bash
npx ai-agent-bootstrap init
```

If this saves your team time, open an issue or PR to help improve provider templates.

## License

MIT
