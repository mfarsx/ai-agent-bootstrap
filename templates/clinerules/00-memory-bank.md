# Memory Bank

Cline's memory resets completely between sessions. Memory Bank solves this. At the start of EVERY task, ALL files in `memory-bank/` MUST be read — this is not optional.

## Structure

```
memory-bank/
├── projectbrief.md      # Core requirements and goals (foundation)
├── productContext.md     # Why this project exists, UX goals
├── activeContext.md      # Current focus, recent changes, next steps
├── systemPatterns.md     # Architecture decisions, design patterns
├── techContext.md        # Tech stack, setup, constraints, dependencies
└── progress.md           # What works, what's left, known issues
```

Files are hierarchical: `projectbrief.md` is the foundation, others build on it. `activeContext.md` updates most frequently.

## When to Update

- After implementing significant changes
- When discovering new project patterns
- When user says **"update memory bank"** (review ALL files)
- When context becomes unclear

## Rules

- Read all memory-bank files at the start of every task
- Preserve existing information when updating — append, don't overwrite
- Keep `activeContext.md` current at the end of every session
- Keep files concise — 1-2 pages max per file
- Link to separate docs for detailed information
