# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-04-19

### Changed

- Replaced `inquirer` with `prompts` to reduce transitive dependency surface.
- Replaced `fs-extra` with a native `node:fs/promises` helper module.
- Regenerated lockfile after dependency graph cleanup.

### Removed

- Removed direct dependencies `inquirer` and `fs-extra`.
- Removed related transitive tree introduced by the old prompt/filesystem stack (including packages such as `ora`, `rxjs`, and `lodash`).
