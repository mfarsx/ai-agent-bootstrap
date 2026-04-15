---
trigger: always_on
---

# Memory Bank

This project uses a file-based memory bank in `memory-bank/` for persistent context. Cascade's auto-memories complement this but do not replace it.

At the start of every conversation, read all files in `memory-bank/`:
- `projectbrief.md` — core requirements and goals (read first)
- `productContext.md` — why this exists, UX goals
- `activeContext.md` — current focus, recent changes, next steps
- `systemPatterns.md` — architecture decisions, design patterns
- `techContext.md` — tech stack, setup, constraints
- `progress.md` — what works, what's left, known issues

## Updating Rules
- After significant changes → update `activeContext.md`
- At milestones → update `progress.md`
- On "update memory bank" → review and update all files
- Append new info — don't overwrite existing content
- Max 2 pages per file
