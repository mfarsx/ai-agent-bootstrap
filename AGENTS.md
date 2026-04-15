# AGENTS.md

## Overview

**Project:** ai-agent-bootstrap
**Purpose:** Node.js CLI that bootstraps AI-agent-ready project context with one command. Scaffolds `memory-bank/`, provider-specific rules, and ignore files for tools like Cline, Cursor, Windsurf, and Claude Code.

## Setup

```bash
# Install dependencies
npm install

# Run CLI locally
npm start
# or: node bin/cli.js init -y

# Run tests
npm test

# Lint (if configured)
npm run lint
```

## Project Structure

```
bin/
  cli.js              — CLI entrypoint, command definitions only
src/
  init.js             — scaffolding workflow
  status.js           — file existence audit
  prompts.js          — interactive questions and defaults
  utils.js            — fillTemplate() placeholder replacement
  providers.js        — provider registry and file manifests
  index.js            — programmatic API (initProject, checkStatus)
templates/
  cline/              — Cline templates (baseline, also shared by others)
  cursor/             — Cursor-specific templates
  claude-code/        — Claude Code templates
  openclaw/           — OpenClaw templates
  windsurf/           — Windsurf templates
tests/
  run-tests.js        — lightweight Node test harness (no Jest)
memory-bank/          — persistent project context (read before starting)
```

## Conventions

- **Language:** JavaScript, CommonJS only (`require`/`module.exports`) — no ESM, no TypeScript
- **Runtime:** Node.js 16+
- Commit messages: imperative, lowercase, max 72 chars (`add cursor provider to registry`)
- Branch prefixes: `feat/`, `fix/`, `chore/`
- One logical change per commit
- No `console.log` in `src/` — use `chalk` for all user-facing output
- Functions: single responsibility, max 40 lines

## Key Invariants

- **Non-destructive:** `initProject()` always skips existing files — this is a core product guarantee
- **Provider manifest is source of truth:** `src/providers.js` drives both `init` and `status`
- **`src/index.js` API is stable:** do not change `initProject` / `checkStatus` export shape
- **`ready: true` only when template files exist:** never activate a provider before its templates are in place

## Adding a Provider

1. Add entry to `src/providers.js` with `ready: false`
2. Create template files under `templates/<provider>/`
3. Verify paths match the manifest exactly
4. Set `ready: true`
5. Add tests: generation path + `checkStatus()` totals

## Adding a Placeholder

1. Add `{{NEW_PLACEHOLDER}}` to template files
2. Register in `fillTemplate()` in `src/utils.js`
3. Add default in `getDefaults()` in `src/prompts.js`
4. Add test coverage

## Context Files

Read these before starting any task:

- `memory-bank/projectbrief.md` — requirements and goals
- `memory-bank/activeContext.md` — current state and next steps
- `memory-bank/progress.md` — completed work and known issues
- `memory-bank/systemPatterns.md` — architecture decisions
- `memory-bank/techContext.md` — stack and constraints

## Workflows

For task-specific workflows, see `.cursor/workflows/`:

- `plan.md` — plan before coding
- `commit.md` — stage and commit changes
- `review.md` — self-review before committing
- `checkpoint.md` — save progress to memory bank
- `status.md` — quick project health check
- `cleanup.md` — remove dead code and debug artifacts
- `stuck.md` — break out of a loop

## Boundaries

- Do not delete or rename files without asking
- Do not install dependencies without discussion — prefer existing ones (`commander`, `inquirer`, `fs-extra`, `chalk`)
- Do not convert CommonJS to ESM
- Do not change `module.exports` shape of `src/index.js`
- Do not modify `.env` or commit secrets
- Do not push to git — user handles all git operations
- Match existing code style and patterns
- Run `npm test` before considering any task complete
