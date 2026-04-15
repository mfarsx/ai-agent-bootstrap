# Boundaries

These are hard rules. Do NOT break them without explicit user approval.

## Never Do

- Never delete or rename existing files without asking first
- Never install a major dependency (framework, ORM, CSS library) without discussing it
- Never change the project's build system or toolchain
- Never modify `.env` files or commit secrets/API keys
- Never push to git — the user handles all git operations
- Never modify files outside the project root

## Always Do

- Always preserve existing code style and patterns — match what's already there
- Always check if a file exists before creating a new one with a similar name
- Always use the project's existing dependencies before adding new ones
- Always keep bundle size in mind — prefer small, focused packages over kitchen-sink libraries
- Always verify that `public/` assets referenced in code actually exist after changes
