---
trigger: always_on
---

# Coding Standards

## Style
- Readability over cleverness
- DRY, but no premature abstraction
- Functions: single responsibility, max 40 lines
- Descriptive names, no magic numbers
- Comments explain "why", not "what"

## File Organization
- One responsibility per file
- Import order: external → internal → relative → types/styles
- Remove unused imports and dead code

## Error Handling
- Never swallow errors — handle or propagate
- User-facing errors must be meaningful
- No `console.log` in production code

## Git
- Commit messages: imperative, lowercase, max 72 chars
- Branch prefixes: `feat/`, `fix/`, `chore/`
- One logical change per commit

## Completion Checklist
- No linter/compiler warnings
- Existing functionality unbroken
- New code matches existing patterns
- Edge cases handled (empty, loading, error states)
