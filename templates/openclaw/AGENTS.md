# Agents

## Memory Bank

This project uses a `memory-bank/` directory for persistent context. At the start of every task, read all files:

- `projectbrief.md` — core requirements and goals (foundation, read first)
- `productContext.md` — why this exists, UX goals
- `activeContext.md` — current focus, recent changes, next steps
- `systemPatterns.md` — architecture decisions, design patterns
- `techContext.md` — tech stack, setup, constraints
- `progress.md` — what works, what's left, known issues

### Updating
- After significant changes → update `activeContext.md`
- At milestones → update `progress.md`
- On "update memory bank" → review and update all files
- Append — don't overwrite existing content

## Task Workflow

### Starting
1. Read all `memory-bank/` files
2. Check `activeContext.md` for current state
3. Complex tasks: plan first, then implement

### Executing
- Smallest change that solves the problem
- Don't refactor unrelated code during a fix
- Test after each meaningful change
- Split files exceeding 300 lines

### Completing
1. Verify the change works
2. Check for linter/compiler errors
3. Update `memory-bank/activeContext.md`
4. Update `memory-bank/progress.md` at milestones

### When Stuck
- Re-read relevant memory-bank files
- Check existing codebase patterns first
- Ask for clarification rather than guessing
- After 2-3 failed attempts: try a different approach
