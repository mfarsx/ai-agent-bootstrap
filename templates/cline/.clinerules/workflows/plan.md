# /plan

Triggered when user types `/plan` in chat.

## Purpose

Create a concrete implementation plan before writing any code. Prevents the agent from diving into code without understanding the full scope.

## Steps

1. **Clarify the goal**
   - Restate what the user wants in one sentence
   - If anything is ambiguous, ask NOW — not after 5 files are changed
   - Check memory bank for any prior context or decisions about this feature

2. **Map the affected files**
   - List every file that will need to change
   - For each file, describe the change in one line
   - Identify files that might be affected indirectly (imports, types, tests)
   - Flag any new files that need to be created

3. **Define the order of operations**
   - Number the steps sequentially
   - Dependencies first (types/interfaces → utils → components → pages)
   - Each step should be independently testable if possible
   - Mark any step that's risky or uncertain with ⚠️

4. **Identify risks**
   - What could go wrong?
   - What existing functionality might break?
   - Are there any files over 300 lines that will grow further?
   - Are there any new dependencies needed?

5. **Estimate scope**
   - Small (1-3 files, < 30 min)
   - Medium (4-8 files, 30-60 min)
   - Large (8+ files, 60+ min) → consider breaking into sub-tasks

6. **Present the plan**
   - Show the complete plan to the user
   - Format:
     ```
     Goal: [one sentence]
     Scope: [small/medium/large]
     Files: [count]

     Steps:
     1. [action] → [file]
     2. [action] → [file]
     ...

     Risks:
     - [risk 1]
     ```
   - Wait for user approval before starting execution

## Rules

- Do NOT write any code during planning
- If the task is small and obvious (fix a typo, change a color), skip the plan and just do it
- If the user says "just do it" — respect that, switch to act mode
- Keep the plan under 20 lines — this is a map, not a novel

---

## Project-specific guidance (optional)

{{PLAN_WORKFLOW_GUIDANCE}}
