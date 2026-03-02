---
"lightnet": major
"@lightnet/sveltia-admin": major
---

Restructure LightNet config to support split file loading.

## Breaking changes

- Translation data is now expected in `config.translations` (directly or via `loadConfig()`), instead of being implicitly consumed from runtime translation files.
- `resolveDefaultLocale` is no longer exported from `lightnet/i18n`.

## Language config note

Language definitions are now content entries:

- `src/content/languages/{bcp47}.json`
- each file must define `{ code, label }`
- file name (without extension) must equal the `code` value

When using split config files:

- Configure locale behavior in `/src/config/*.json` with:
  - `siteLanguages: string[]`
  - `defaultSiteLanguage: string`
  - `fallbackLanguages: Record<string, string[]>`

## New

- Export `loadConfig()` from `lightnet` to load and merge config from:
  - `/src/config/*.json`
  - `/src/translations/*.(yml|yaml)`
  - `/src/config/translations/*.(yml|yaml)`
- Sveltia Admin now manages `languages` from `/src/content/languages` as a content collection.
