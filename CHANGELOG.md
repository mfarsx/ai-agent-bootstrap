# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
