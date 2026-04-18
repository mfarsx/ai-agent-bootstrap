
# /init-memory

## Purpose

Populate the `memory-bank/` files for a new or existing project. Use this at the start of a project to give the AI agent a complete, accurate context baseline it can rely on from session one.

## Steps

1. **Gather project information**
   - Ask the user (or scan the codebase if it already exists) for:
     - Project name and one-sentence description
     - Primary goals (3-5 bullet points)
     - Target audience
     - Core requirements (non-negotiable features)
     - Tech stack and key dependencies
     - Current project state (brand new / partially built / existing)
   - If a codebase is present, read `package.json`, `README.md`, or equivalent to infer answers before asking

2. **Write `projectbrief.md`**
   - Fill in: Overview, Goals, Target Audience, Core Requirements, Out of Scope
   - Keep it factual - this is the foundation all other files reference
   - Do NOT use placeholder comments; every section must have real content

3. **Write `productContext.md`**
   - Fill in: Why This Project Exists, How It Should Work, User Experience Goals, Key Differentiators
   - Focus on the "why" and the user perspective, not implementation details

4. **Write `activeContext.md`**
   - Current Focus: what the very next piece of work is
   - Recent Changes: empty or "initial setup" if brand new
   - Next Steps: first 3-5 actionable items, ordered by priority
   - Active Decisions: any open architectural or product questions
   - Learnings & Insights: empty if brand new

5. **Write `systemPatterns.md`**
   - Architecture: high-level shape of the system (SPA, CLI, monolith, etc.)
   - Key Technical Decisions: choices already made and why
   - Design Patterns in Use: patterns the codebase follows or will follow
   - Component Relationships: how major pieces connect
   - File Structure: describe folder/file organization
   - If the project is brand new, write intended patterns - mark them as "planned"

6. **Write `techContext.md`**
   - Stack, Dependencies, Development Setup commands, Technical Constraints, Tool Configuration
   - Pull real commands from `package.json` scripts or equivalent if available

7. **Write `progress.md`**
   - What Works: completed features (empty if brand new)
   - What''s Left: remaining work in priority order
   - Known Issues: any bugs or tech debt already identified
   - Milestones: key targets if known

8. **Confirm to user**
   - List all 6 files written
   - Show a one-line summary of what was captured per file
   - Ask the user to review and correct anything that looks wrong

## Rules

- Never leave placeholder comments like `<!-- What are you working on? -->` - fill in real content or omit the section
- If the user can''t answer something, write a sensible default and flag it: "(assumed - please verify)"
- Keep each file under 2 pages - link to external docs for detail
- Do not modify any files outside `memory-bank/`
- If any `memory-bank/` file already has content, read it first and merge - do not overwrite without asking
