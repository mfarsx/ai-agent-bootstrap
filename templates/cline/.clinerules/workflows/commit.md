# /commit

Triggered when user types `/commit` in chat.

## Steps

1. **Scan changes**
   - Run `git diff --stat` and `git diff` to see all modified files
   - Run `git status` to check untracked files
   - If no changes found, inform the user and stop

2. **Analyze & group**
   - Read through the diffs carefully
   - Group related changes into logical commits (1 commit = 1 logical change)
   - If ALL changes are part of a single logical unit, prepare one commit
   - If changes span unrelated concerns, propose splitting into multiple commits

3. **Pre-commit checks**
   - Run the project's linter if configured (`npm run lint`, `cargo check`, etc.)
   - Run the project's type checker if applicable (`tsc --noEmit`, `mypy`, etc.)
   - If checks fail: show errors, offer to fix, do NOT proceed to commit

4. **Generate commit message(s)**
   - Follow the project's commit convention from `01-coding-standards.md`
   - Default format: imperative mood, lowercase, max 72 chars
   - If the change is complex, add a body separated by a blank line
   - Show the proposed commit(s) to the user in this format:
     ```
     Commit 1: <message>
       - file1.ts
       - file2.ts

     Commit 2: <message>
       - file3.ts
     ```

5. **Wait for approval**
   - Do NOT run `git commit` without explicit user confirmation
   - User may edit messages, re-group, or cancel
   - After approval, stage the relevant files and commit each group

6. **Post-commit**
   - Run `git log --oneline -5` to confirm
   - Do NOT push — user handles push manually

## Rules

- Never use `git add .` — stage only the files belonging to each logical commit
- Never commit `.env`, secrets, or generated files unless explicitly told to
- If unsure whether changes should be 1 or 2 commits, prefer smaller commits
- Never push to remote — this workflow ends at local commit

---

## Project-specific guidance (optional)

{{COMMIT_WORKFLOW_GUIDANCE}}
