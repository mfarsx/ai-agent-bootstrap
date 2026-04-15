# /checkpoint

Triggered when user types `/checkpoint` in chat.

## Purpose

Save a snapshot of current progress to memory bank. Use this mid-session to create a recovery point before complex changes, or when context is getting long.

## Steps

1. **Summarize current state**
   - What was the task/goal for this session?
   - What has been done so far? (list concrete changes, not vague descriptions)
   - What's the current state? (working? broken? partially done?)
   - What are the immediate next steps?

2. **Update `activeContext.md`**
   - Replace "Current Focus" with what's being worked on right now
   - Update "Recent Changes" with the last 3-5 concrete things done
   - Update "Next Steps" with the prioritized remaining work
   - Add any "Active Decisions" if there are open questions
   - Add any "Learnings & Insights" discovered during the session

3. **Conditionally update `progress.md`**
   - Only if a feature or component was completed → add to "What Works"
   - Only if new issues were discovered → add to "Known Issues"
   - Otherwise skip this file

4. **Confirm to user**
   - Show a brief summary of what was saved
   - Format: "Checkpoint saved: [one-line summary of current state]"

## Rules

- Keep entries concise — bullet points, not paragraphs
- Preserve existing content in memory bank files — append/update, don't overwrite
- This is a save point, not a review — be fast, don't analyze
- If mid-task, note the exact point where work can resume (e.g., "completed step 3 of 5, next is...")
