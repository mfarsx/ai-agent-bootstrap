---
name: plan
description: Create an implementation plan before writing code. Use when a task touches 2+ files, the approach is unclear, there are multiple valid approaches, or the user asks for a plan.
---

# /plan - Implementation Plan Before Coding

Use when: task involves 2+ files, or approach is unclear.

## Steps

1. **Clarify the goal** - restate in one sentence. Ask NOW if anything is ambiguous.

2. **Map affected files**
   - Every file that changes + one-line description of the change
   - Indirect impacts (imports, tests, README)
   - New files to create

3. **Define order of operations** - numbered, dependencies first. Mark risky steps ??

4. **Identify risks**
   - What could break?
   - New dependencies needed?
   - Files > 300 lines that will grow further?

5. **Estimate scope**: Small (1-3 files) / Medium (4-8 files) / Large (8+ files)

6. **Present plan and wait for approval**
   ```
   Goal: [one sentence]
   Scope: [small/medium/large]

   Steps:
   1. [action]  [file]
   2. [action]  [file]

   Risks:
   - [risk]
   ```

## Rules
- Do NOT write any code during planning
- Skip plan for obviously small tasks (typo fix, single-line change)
- Keep plan under 20 lines
- If user says "just do it" - do it
