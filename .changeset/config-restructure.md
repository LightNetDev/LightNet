---
"lightnet": major
---

Restructure LightNet config to support split file loading.

## Breaking changes

- Translation data is now expected in `config.translations` (directly or via `loadConfig()`), instead of being implicitly consumed from runtime translation files.
- `resolveDefaultLocale` is no longer exported from `lightnet/i18n`.

## Language config note

`languages` continues to use the array shape:

- `languages: [{ code, label, ... }]`
- `code` is required and validated as BCP-47.

When using split config files:

- Keep one language per file in `/src/config/languages/*.json`
- Each file must include a `code` field
- The file name (without extension) must exactly equal the `code` value

## New

- Export `loadConfig()` from `lightnet` to load and merge config from:
  - `/src/config/*.json`
  - `/src/config/languages/*.json`
  - `/src/translations/*.(yml|yaml)`
  - `/src/config/translations/*.(yml|yaml)`
