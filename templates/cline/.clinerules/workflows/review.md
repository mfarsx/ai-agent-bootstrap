# /review

Triggered when user types `/review` in chat.

## Purpose

Self-review all uncommitted changes before committing. Catch bugs, forgotten edge cases, and code quality issues.

## Steps

1. **Gather changes**
   - Run `git diff` for modified tracked files
   - Run `git diff --cached` for staged files
   - Run `git status` to check for untracked files that should be reviewed
   - If no changes, inform the user and stop

2. **Review each file** — check for:
   - **Bugs**: logic errors, off-by-one, null/undefined access, race conditions
   - **Leftover junk**: `console.log`, `TODO` that should be resolved, commented-out code, debug flags
   - **Error handling**: are new code paths handling failures? empty states? loading states?
   - **Security**: hardcoded secrets, SQL injection, XSS, exposed internal paths
   - **Naming**: do new variables/functions clearly describe what they do?
   - **Consistency**: does new code follow existing patterns in the codebase?

3. **Check cross-file impact**
   - If a function signature changed, are all callers updated?
   - If a component's props changed, are all usages updated?
   - If a type/interface changed, does everything still compile?
   - If an API endpoint changed, is the client code updated?

4. **Report findings**
   - Group issues by severity:
     - 🔴 **Must fix** — bugs, security issues, broken functionality
     - 🟡 **Should fix** — code quality, missing edge cases, naming
     - 🟢 **Nitpick** — style, minor improvements, optional
   - If no issues found, say so clearly

5. **Offer to fix**
   - For each 🔴 and 🟡 issue, offer a concrete fix
   - Wait for user approval before making changes
   - After fixes, re-run the relevant checks

## Rules

- Be honest — don't say "looks good" if there are issues
- Don't refactor working code that wasn't part of the change
- Focus on the diff, not the entire codebase
- If unsure whether something is a bug, flag it as a question rather than silently ignoring
