---
"lightnet": major
---

Language configuration was split into two explicit sources:

- Site locales are configured in `lightnet.config.*` via `siteLanguages`.
- Language metadata is stored as content entries in `src/content/languages/{bcp47}.json`.

This removes duplicated language metadata from config and makes locale behavior explicit.

Example `siteLanguages` config:

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

Example language content entry (`src/content/languages/en.json`):

```json
{
  "label": {
    "en": "English",
    "de": "Englisch"
  }
}
```

## Breaking changes

- Removed top-level `languages` from `lightnet.config.*`.
- `siteLanguages` must use object entries: `{ code, isDefault?, fallback? }`.
- Exactly one `siteLanguages` entry must have `isDefault: true`.
- Language metadata now comes from `src/content/languages/{bcp47}.json` entries.

## Migration

1. Replace legacy `languages` config with `siteLanguages`.

```json
// before
{
  "languages": [
    { "code": "en", "label": "English", "isDefaultSiteLanguage": true },
    {
      "code": "de",
      "label": "Deutsch",
      "isSiteLanguage": true,
      "fallbackLanguages": ["ru"]
    },
    { "code": "es", "label": "Espanol" }
  ]
}

// after
{
  "siteLanguages": [
    {
      "code": "en",
      "isDefault": true
    },
    {
      "code": "de",
      "fallback": ["ru"]
    }
  ]
}
```

2. Move language metadata into `src/content/languages/*.json`.

```json
// src/content/languages/en.json
{
  "code": "en",
  "label": {
    "en": "English",
    "de": "Englisch"
  }
}
```

Notes:

- `fallback` is optional and defaults to an empty array.
- `code` values should be valid BCP-47 tags.
- `fallback` values may reference locales not listed in `siteLanguages`.
