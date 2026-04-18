
# /cleanup - Remove Dead Code and Debug Artifacts

## Steps

1. **Scan for junk**
   - `console.log` debug statements (not intentional logging)
   - Commented-out code blocks (2+ lines)
   - Unused imports, variables, functions
   - Empty/placeholder files
   - TODOs referencing already-completed work

2. **Run auto-fix tools**
   - `npm run lint -- --fix` if configured

3. **Report before changing**
   - List every item with file and line
   - Group by type
   - Show count: "Found X items across Y files"
   - Wait for approval

4. **Apply cleanups** file by file  run `npm test` after to confirm nothing broke

## Rules
- Only remove obvious junk - never remove code that "looks unused"
- Do not refactor, rename, or restructure - cleanup only
- Keep intentional logging (error handlers) - only remove debug artifacts
- Flag uncertain items to user instead of removing
