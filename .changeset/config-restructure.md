---
"lightnet": major
"@lightnet/sveltia-admin": major
---

LightNet configuration and language handling were restructured to use explicit locale settings and language content entries. This makes locale behavior clearer and removes implicit language definitions from config.

Example locale settings in LightNet config now look like:

```json
{
  "siteLanguages": [
    {
      "code": "en",
      "isDefault": true
    },
    {
      "code": "de",
      "fallback": ["en"]
    }
  ]
}
```

## Breaking changes

- LightNet config now uses explicit locale settings with `siteLanguages` as object entries.
- Removed top-level `defaultSiteLanguage` from LightNet config.
- Removed top-level `fallbackLanguages` from LightNet config.
- `siteLanguages` no longer accepts a `string[]`.
- `siteLanguages` now requires objects: `{ code, isDefault?, fallback? }`.
- Exactly one `siteLanguages` item must define `isDefault: true`.
- Config labels now use inline locale maps instead of plain strings.
- `resolveDefaultLocale` is no longer exported from `lightnet/i18n`.
- Language definitions are now content entries in `src/content/languages/{bcp47}.json`.
- Sveltia Admin now manages `languages` from `/src/content/languages` as a content collection.

## Migration

1. Replace old language config structures with explicit locale fields in your LightNet config.

```json
// before
{
  "title": "My Library",
  "languages": [
    { "code": "en", "label": "English" }
  ]
}

// after
{
  "title": { "en": "My Library" },
  "siteLanguages": [
    {
      "code": "en",
      "isDefault": true
    }
  ]
}
```

2. Move language definitions into content files.

```json
// src/content/languages/en.json
{
  "code": "en",
  "label": {
    "en": "English"
  }
}
```

Notes:

- `fallback` is optional and defaults to an empty array.
- Fallback target language codes can still point to locales outside configured `siteLanguages`.
