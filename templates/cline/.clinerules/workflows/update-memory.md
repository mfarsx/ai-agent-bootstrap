# /update-memory

Triggered when user types `/update-memory` in chat.

## Purpose

Sync the `memory-bank/` files with the current state of the project. Use this after a significant work session, before a long break, or whenever the memory bank feels stale.

## Steps

1. **Read all current memory-bank files**
   - Read every file in `memory-bank/` before changing anything
   - Note what is outdated, missing, or incorrect in each file

2. **Review what changed**
   - Ask the user: "What changed since the last update?" if context is unclear
   - Or scan recent git history: `git log --oneline -10` to identify what was done
   - Cross-reference with `activeContext.md` → Recent Changes and Next Steps

3. **Update `activeContext.md`** (always update this file)
   - Current Focus: replace with what is being worked on right now
   - Recent Changes: replace with the last 3-5 concrete things done this session
   - Next Steps: update with the current prioritized remaining work
   - Active Decisions: add new open questions; remove resolved ones
   - Learnings & Insights: append anything discovered that is worth remembering

4. **Update `progress.md`** (update if features changed)
   - Move completed items from "What's Left" to "What Works"
   - Add newly discovered issues to "Known Issues"
   - Update "What's Left" with any new tasks uncovered during the session
   - Add milestone entries if a significant version or target was reached

5. **Update `systemPatterns.md`** (update if architecture changed)
   - Add new patterns adopted during this session
   - Correct any decisions that were revised
   - Update Component Relationships if new modules or integrations were added

6. **Update `techContext.md`** (update if stack or tooling changed)
   - Add new dependencies introduced
   - Update setup commands if they changed
   - Add new constraints discovered

7. **Update `projectbrief.md` and `productContext.md`** (update only if scope changed)
   - These are stable by design — only update if goals, requirements, or product direction shifted
   - If you do update them, be explicit with the user about what changed and why

8. **Confirm to user**
   - List every file that was updated
   - For each updated file, give a one-line summary of what changed
   - Format:
     ```
     Memory bank updated:
     ✔ activeContext.md — focus shifted to auth flow; next steps updated
     ✔ progress.md — login feature moved to "What Works"; 2 new issues added
     ↷ systemPatterns.md — no changes needed
     ↷ projectbrief.md — no changes needed
     ```

## Rules

- Always append or update — never delete existing content without a clear reason
- Keep each file under 2 pages — summarize rather than transcribe
- Do not modify any files outside `memory-bank/`
- If unsure whether something belongs in memory bank, add it and flag it: "(to review)"
- This is a sync operation, not a rewrite — preserve the user's voice and past decisions
