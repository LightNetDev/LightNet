---
"lightnet": major
"@lightnet/sveltia-admin": major
---

Restructure LightNet config and language definitions.

## Breaking changes

- LightNet config now uses explicit locale settings:
  - `defaultSiteLanguage: string`
  - `siteLanguages: string[]`
  - `fallbackLanguages: Record<string, string[]>`
- Config labels now use inline locale maps instead of plain strings.
- `resolveDefaultLocale` is no longer exported from `lightnet/i18n`.

## Language definitions

Language definitions are now content entries:

- `src/content/languages/{bcp47}.json`
- each file must define `{ code, label }`
- file name (without extension) must equal the `code` value

## Sveltia Admin

Sveltia Admin now manages `languages` from `/src/content/languages` as a content collection.
