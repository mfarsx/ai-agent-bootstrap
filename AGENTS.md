# AGENTS.md

## Overview

**Project:** ai-agent-bootstrap



## Setup

```bash
# Install dependencies
# update with your install command

# Run dev server
# update with your dev command

# Run tests
# update with your test command

# Lint / type check
# update with your lint/typecheck command
```

## Project Structure

```
src/
  ├── index.js
  └── ...
```

## Conventions

- TypeScript strict mode
- Imperative lowercase commit messages, max 72 chars
- Branch prefixes: `feat/`, `fix/`, `chore/`
- One logical change per commit
- Import order: external → internal → relative → types/styles

## Context Files

This project maintains persistent context in `memory-bank/`:
- `projectbrief.md` — requirements and goals
- `activeContext.md` — current state and next steps
- `progress.md` — completed work and known issues

Read these before starting any task.

## Boundaries

- Do not delete/rename files without asking
- Do not install major dependencies without discussion
- Do not modify `.env` or commit secrets
- Do not push to git
- Match existing code patterns
