# /status

Triggered when user types `/status` in chat.

## Purpose

Quick project health check. Show where things stand in 30 seconds.

## Steps

1. **Git status**
   - Run `git status` — show branch, uncommitted changes, untracked files
   - Run `git log --oneline -5` — show recent commits

2. **Memory bank summary**
   - Read `activeContext.md` — current focus and next steps
   - Read `progress.md` — what works and what's left
   - Combine into a brief status report

3. **Health checks** (run only what applies to the project)
   - Linter: any warnings/errors? (`npm run lint`, `cargo check`, etc.)
   - Type checker: passing? (`tsc --noEmit`, `mypy`, etc.)
   - Tests: passing? (`npm test`, `pytest`, `cargo test`, etc.)
   - Dev server: can it start without errors?

4. **Present the report**
   ```
   Branch: main (+3 uncommitted files)
   Last commit: fix responsive layout on mobile

   Current focus: User authentication flow
   What works: Login, signup, session management
   Next: Password reset, email verification

   Health:
   ✅ Linter — clean
   ⚠️ Tests — 2 failing
   ✅ Types — no errors
   ```

## Rules

- Be brief — this is a dashboard, not a novel
- If health checks aren't configured for this project, skip them and note it
- Don't fix anything — just report
- If memory bank files are empty, say so — suggest running `/checkpoint` or updating them
