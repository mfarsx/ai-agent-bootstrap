---
trigger: always_on
---

# Boundaries

Non-negotiable rules. Do NOT break without explicit user approval.

## Never
- Delete or rename files without asking
- Install major dependencies (framework, ORM, CSS lib) without discussion
- Change the build system or toolchain
- Modify `.env` files or commit secrets/API keys
- Push to git — user handles all git operations
- Modify files outside the project root

## Always
- Match existing code style and patterns
- Check if a file exists before creating a similar one
- Prefer existing dependencies over new ones
- Consider bundle size — focused packages over kitchen-sink libraries
- Verify `public/` asset references exist after changes
