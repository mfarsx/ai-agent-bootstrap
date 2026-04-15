# Workflow

## Starting a Task

1. Read all `memory-bank/` files first
2. Understand the current state from `activeContext.md` and `progress.md`
3. If the task is complex, start in **Plan mode** — outline the approach before writing code
4. Switch to **Act mode** only after the plan is clear

## Making Changes

- Make the smallest change that solves the problem
- Don't refactor unrelated code while fixing a bug
- Test after each meaningful change — don't batch 5 changes and test at the end
- If a file grows beyond 300 lines, consider splitting it

## Before Completing a Task

1. Verify the change works (run dev server, check browser, run tests)
2. Check for linter/compiler errors
3. Update `memory-bank/activeContext.md` with what changed and what's next
4. If it was a significant milestone, update `memory-bank/progress.md` too

## When Stuck

- Re-read the relevant memory-bank files for context
- Check existing patterns in the codebase before inventing new ones
- Ask the user for clarification rather than guessing
- If an approach isn't working after 2-3 attempts, step back and try a different strategy

## Communication

- Be direct — say what you're doing and why
- If you're unsure about something, say so explicitly
- When multiple approaches exist, briefly explain the tradeoffs and recommend one
- Don't over-explain obvious changes
