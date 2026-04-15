# /cleanup

Triggered when user types `/cleanup` in chat.

## Purpose

Remove junk from the codebase — dead code, debug artifacts, unused imports. Safe, mechanical cleanup only.

## Steps

1. **Scan for common junk**
   - `console.log` / `print()` debug statements (not intentional logging)
   - Commented-out code blocks (more than 2 lines)
   - Unused imports (run linter or check manually)
   - Unused variables and functions
   - Empty files or placeholder files with no content
   - `TODO`/`FIXME` comments that reference completed work

2. **Run automated tools if available**
   - Linter with auto-fix: `npm run lint -- --fix`, `ruff check --fix`, etc.
   - Formatter: `prettier --write`, `black`, `cargo fmt`, etc.
   - If no tools are configured, do it manually

3. **Report findings before changing**
   - List every cleanup item found with file and line
   - Group by type (debug logs, dead code, unused imports, etc.)
   - Show the count: "Found X items across Y files"
   - Wait for user approval before applying changes

4. **Apply cleanups**
   - Make changes file by file
   - After all changes, run linter/type checker to confirm nothing broke
   - Show a summary: "Cleaned X items across Y files"

## Rules

- ONLY remove obvious junk — never remove code that "looks unused" but might be needed
- Do not refactor, rename, or restructure anything — this is cleanup, not improvement
- Do not touch test files unless explicitly asked
- If unsure whether something is junk or intentional, skip it and flag it to the user
- Keep intentional logging (error handlers, API logging) — only remove debug artifacts
