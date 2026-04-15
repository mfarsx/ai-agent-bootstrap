# Coding Standards

## General Principles

- Readability over cleverness — always
- DRY, but avoid premature abstraction
- Functions should do one thing and stay under 40 lines
- Variable and function names must clearly describe their purpose
- No magic numbers — define as named constants
- Comments explain "why", not "what"

## File Organization

- One responsibility per file
- Import order: external packages → internal modules → relative imports → types/styles
- Remove unused imports, variables, and dead code

## Error Handling

- Never swallow errors silently — handle or propagate
- Show meaningful error messages to users
- No leftover `console.log` in production code

## Git

- Commit messages: imperative mood, lowercase, max 72 chars
  - `add user authentication flow`
  - `fix mobile layout overflow on safari`
- Branch naming: `feat/`, `fix/`, `chore/` prefixes
- Commit small, commit often — each commit should be one logical change

## Code Review Checklist

Before considering any task complete:
1. No linter/compiler warnings
2. All existing functionality still works
3. New code follows existing patterns in the codebase
4. Edge cases are handled (empty states, loading, errors)
