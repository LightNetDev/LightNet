---
lightnet: major
---

LightNet language configuration has been simplified into a single `siteLanguages` array of objects.

## Breaking changes

- Removed top-level `defaultSiteLanguage` from LightNet config.
- Removed top-level `fallbackLanguages` from LightNet config.
- `siteLanguages` no longer accepts a `string[]`.
- `siteLanguages` now requires objects: `{ code, isDefault?, fallback? }`.
- Exactly one `siteLanguages` item must define `isDefault: true`.

## Migration

Update your LightNet config language section.

```json
// before
{
  "defaultSiteLanguage": "en",
  "siteLanguages": ["en", "de"],
  "fallbackLanguages": {
    "de": ["es"]
  }
}
```

```json
// after
{
  "siteLanguages": [
    {
      "code": "en",
      "isDefault": true
    },
    {
      "code": "de",
      "fallback": ["es"]
    }
  ]
}
```

Notes:

- `fallback` is optional and defaults to an empty array.
- Fallback target language codes can still point to locales outside configured `siteLanguages`.
