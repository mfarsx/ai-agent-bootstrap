# AGENTS.md

## Overview

**Project:** {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Setup

```bash
# Install dependencies
{{INSTALL_COMMAND}}

# Run dev server
{{DEV_COMMAND}}

# Run tests
{{TEST_COMMAND}}

# Lint / type check
{{LINT_COMMAND}}
```

## Project Structure

```
{{PROJECT_STRUCTURE}}
```

## Conventions

- Follow `techContext.md` for language/tooling conventions
- Imperative lowercase commit messages, max 72 chars
- Branch prefixes: `feat/`, `fix/`, `chore/`
- One logical change per commit
- Import order: external → internal → relative → types/styles

## Context Files

This project maintains persistent context in `memory-bank/`:
- `projectbrief.md` - requirements and goals
- `activeContext.md` - current state and next steps
- `progress.md` - completed work and known issues

Read these before starting any task.

## Rules

Rules live in `.clinerules/` and are loaded automatically:
- `00-memory-bank.md` - memory bank protocol
- `01-coding-standards.md` - style conventions
- `02-workflow.md` - task execution flow
- `03-boundaries.md` - hard constraints

## Workflows

Slash-command workflows live in `.clinerules/workflows/`:
- `/init-memory` - bootstrap memory bank
- `/update-memory` - sync memory bank
- `/plan`, `/commit`, `/review`, `/checkpoint`, `/status`, `/cleanup`, `/stuck`

## Boundaries

- Do not delete/rename files without asking
- Do not install major dependencies without discussion
- Do not modify `.env` or commit secrets
- Do not push to git
- Match existing code patterns