# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-04-22

### Added

- `init` now detects fully initialized directories and exits early with guidance toward `status`, `reset`, or `init --force`.
- Added provider-state suggestion output for unspecified-provider runs: when existing provider footprints are detected, `init` now prints actionable modify/install commands per provider.
- Added `init --force` to bypass early-exit checks and re-run prompt flow.
- Added `init --verbose` to show full per-file skip output.
- Added `init --quiet` to print a compact "In sync. No changes applied." line when a re-run produces no file or `.gitignore` changes.
- Added a grouped "Quick Doc" block to `init` next-steps output, organized under `Memory`, `Workflow`, and `Utility` headings.
- Added a new `src/core/init-analyzer.js` state analyzer and dedicated test coverage.

### Changed

- `init` output is now compact by default: skipped files are summarized instead of always printed line-by-line.
- Partial initialization no longer re-prompts by default; missing files are auto-filled using defaults/config context.
- For provider-omitted flows, `init` no longer assumes one detected provider in mixed-provider repositories; it returns suggestion-first guidance instead.

### Removed

- Removed the legacy `ai-bootstrap` bin name. The CLI ships only as `ai-agent-bootstrap`.
- Removed the `init --var KEY=VALUE` option. Use `bootstrap.config.json` `templateVariables` or the programmatic `collectInitData({ templateVariables })` seam instead.

### Notes

- If you script against detailed init output, use `init --verbose`.

## [1.2.0] - 2026-04-19

### Changed

- Replaced `inquirer` with `prompts` to reduce transitive dependency surface.
- Replaced `fs-extra` with a native `node:fs/promises` helper module.
- Bumped minimum Node.js version to 18.
- Regenerated lockfile after dependency graph cleanup.

### Removed

- Removed direct dependencies `inquirer` and `fs-extra`.
- Removed related transitive tree introduced by the old prompt/filesystem stack (including packages such as `ora`, `rxjs`, and `lodash`).

### Fixed

- Aligned declared Node engines range with the runtime requirement by regenerating lockfile metadata from the updated `package.json` engine floor.

## [1.1.6] - earlier

- Maintenance and compatibility updates from prior release cycle.
