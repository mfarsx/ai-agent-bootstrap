---
description: "/checkpoint workflow"
---


# /checkpoint - Save Progress to Memory Bank

Use when: mid-session recovery point, before complex changes, or long context.

## Steps

1. **Summarize current state**
   - What was the task/goal this session?
   - What has been done? (concrete changes, not vague descriptions)
   - What is the current state? (working / broken / partially done)
   - What are the immediate next steps?

2. **Update `memory-bank/activeContext.md`**
   - "Current Focus"  what's being worked on right now
   - "Recent Changes"  last 3-5 concrete things done
   - "Next Steps"  prioritized remaining work
   - "Active Decisions"  any open questions
   - Append - do NOT overwrite existing content

3. **Conditionally update `memory-bank/progress.md`**
   - Only if a feature was completed  add to "What Works"
   - Only if new issues found  add to "Known Issues"
   - Otherwise skip

4. **Confirm**: `Checkpoint saved: [one-line summary]`

## Rules
- Bullet points only - no paragraphs
- Be fast, don't analyze - this is a save point
- If mid-task, note exact resume point (e.g. "completed step 3 of 5, next is...")
