# /stuck

Triggered when user types `/stuck` in chat.

## Purpose

Structured escalation when something isn't working. Break out of the loop instead of retrying the same failed approach.

## Steps

1. **Diagnose the situation**
   - What were we trying to do?
   - What's the exact error or unexpected behavior?
   - What approaches have already been tried?
   - How many attempts have been made?

2. **Gather fresh context**
   - Re-read relevant memory bank files
   - Re-read the actual error output carefully (not from memory — run the command again)
   - Check if the file being edited still looks as expected (could have been corrupted by earlier attempts)

3. **Choose an escalation path based on attempt count:**

   **Attempt 1-2: Retry with more context**
   - Read the full error stack trace, not just the first line
   - Check related files that might be involved
   - Search the codebase for similar patterns that work

   **Attempt 3: Change approach**
   - Stop the current approach entirely
   - List 2-3 alternative approaches
   - Pick the most different one from what was tried
   - Explain the new approach to the user before starting

   **Attempt 4+: Reduce scope**
   - Identify the smallest possible version of the change that could work
   - Strip away all non-essential parts
   - Try to get ANYTHING working first, then build up
   - If still stuck: clearly tell the user what's blocking and what help is needed

4. **If the problem is environmental** (dependency versions, OS, config):
   - Check package versions: `npm ls`, `pip list`, `cargo tree`
   - Check config files for inconsistencies
   - Look at recent changes to config/dependency files with `git log`
   - Suggest the user verify in their terminal if agent can't resolve it

## Rules

- Never retry the exact same approach more than twice
- Always re-read the actual error before the next attempt — don't work from memory
- Be honest about what's not working — don't pretend progress is being made
- If truly stuck after 4+ attempts, say so plainly and ask the user for help
- Don't expand scope when stuck — shrink it
