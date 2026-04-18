
# /stuck - Break Out of a Loop

Use when same approach has failed 2+ times.

## Steps

1. **Diagnose**
   - What were we trying to do?
   - Exact error or unexpected behavior?
   - Approaches already tried?
   - Attempt count?

2. **Gather fresh context**
   - Re-read relevant memory bank files
   - Re-run the failing command - read actual output, not from memory
   - Check if edited file still looks as expected

3. **Escalation by attempt count**

   **1-2 attempts  Retry with more context**
   - Full stack trace, not just first line
   - Check related files
   - Search codebase for similar working patterns

   **3 attempts  Change approach**
   - Stop current approach entirely
   - List 2-3 alternatives, pick the most different
   - Explain new approach to user before starting

   **4+ attempts  Reduce scope**
   - Smallest possible version that could work
   - Strip non-essential parts
   - Get ANYTHING working first, then build up
   - If still stuck: tell user plainly what''s blocking

4. **If environmental** (deps, config):
   - `npm ls` - check versions
   - `git log` on config files for recent changes
   - Ask user to verify in their terminal if agent can''t resolve

## Rules
- Never retry exact same approach more than twice
- Always re-read actual error before next attempt
- Don''t expand scope when stuck - shrink it
- Be honest: if stuck after 4+ attempts, say so and ask for help
