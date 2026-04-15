---
trigger: always_on
---

# Workflow

## Starting a Task
1. Read all `memory-bank/` files first
2. Check `activeContext.md` for current state
3. Complex tasks: use Chat mode to plan, then Write mode to implement

## Making Changes
- Smallest change that solves the problem
- Don't refactor unrelated code during a bug fix
- Test after each meaningful change
- Split files exceeding 300 lines

## Completing a Task
1. Verify the change works (dev server, browser, tests)
2. Check for linter/compiler errors
3. Update `memory-bank/activeContext.md` with changes and next steps
4. Update `memory-bank/progress.md` at milestones

## When Stuck
- Re-read relevant memory-bank files
- Check existing codebase patterns first
- Ask for clarification rather than guessing
- After 2-3 failed attempts: try a different approach

## Communication
- Be direct — state what you're doing and why
- Flag uncertainty explicitly
- Multiple approaches? Explain tradeoffs, recommend one
