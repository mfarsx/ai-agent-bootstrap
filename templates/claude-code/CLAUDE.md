# CLAUDE.md

## Memory Bank

This project uses `docs/context/` for persistent memory. Read ALL files at the start of every task:

- `docs/context/projectbrief.md` — core requirements and goals (read first)
- `docs/context/productContext.md` — why this exists, UX goals
- `docs/context/activeContext.md` — current focus, recent changes, next steps
- `docs/context/systemPatterns.md` — architecture decisions, design patterns
- `docs/context/techContext.md` — tech stack, setup, constraints
- `docs/context/progress.md` — what works, what's left, known issues

Update `activeContext.md` after significant changes. Update `progress.md` at milestones.
On "update memory bank": review and update all files. Append — don't overwrite.

## Coding Standards

- Readability over cleverness
- Functions: single responsibility, max 40 lines
- Descriptive names, no magic numbers — comments explain "why"
- Import order: external → internal → relative → types/styles
- Remove unused imports and dead code
- Never swallow errors — handle or propagate
- No `console.log` in production code
- Git: imperative lowercase commits, max 72 chars, `feat/`/`fix/`/`chore/` branches

## Workflow

1. Read `docs/context/` files first
2. Complex tasks: plan before coding
3. Smallest change that solves the problem
4. Test after each meaningful change
5. Verify: no linter/compiler warnings, existing features still work
6. Update context files when done

When stuck: re-read context files, check existing patterns, ask for clarification. After 2-3 failed attempts, try a different approach.

## Boundaries (Non-Negotiable)

- Never delete/rename files without asking
- Never install major dependencies without discussion
- Never change build system or toolchain
- Never modify `.env` or commit secrets
- Never push to git — user handles git
- Never modify files outside project root
- Always match existing code style and patterns
- Always prefer existing dependencies over new ones
