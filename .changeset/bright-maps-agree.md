---
"@lightnet/cli": major
---

Refactor the CLI entrypoint to a command-per-file architecture under
`packages/cli/commands/*`.

## What changed

- `lightnet` now uses a thin router in `packages/cli/index.mjs`
- Command implementations are split into dedicated modules:
  - `translation-status`
  - `migrate-to-v4`
  - `add-site-locale`

## Command contract

The supported public commands are:

- `lightnet translation-status`
- `lightnet migrate-to-v4 [options]`
- `lightnet add-site-locale --locale <code> [options]`

This release documents and stabilizes the command surface under the new router
layout for future CLI expansion.
