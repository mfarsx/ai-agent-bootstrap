---
name: status
description: Quick project health check covering git state, memory bank freshness, tests, and linter. Use when the user asks for project status, a health check, or a dashboard overview of where things stand.
---

# /status - Quick Project Health Check

## Steps

1. **Git**: `git status` + `git log --oneline -5`

2. **Memory bank**: read `activeContext.md` + `progress.md`  brief summary

3. **Health checks**
   - `npm test` - passing?
   - `npm run lint` - clean?
   - `node bin/cli.js init -y` - CLI works?

4. **Report**
   ```
   Branch: [name] ([N] uncommitted files)
   Last commit: [message]

   Current focus: [from activeContext.md]
   Next: [next steps]

   Health:
   ?/??/? Tests
   ?/??/? Linter
   ?/??/? CLI smoke test
   ```

## Rules
- Brief - dashboard, not a novel
- Don''t fix anything - just report
- Empty memory bank? Note it, suggest running /checkpoint
