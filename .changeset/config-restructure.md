---
"lightnet": major
"@lightnet/sveltia-admin": major
---

LightNet configuration and language handling were restructured to use explicit locale settings and language content entries. This makes locale behavior clearer and removes implicit language definitions from config.

Example locale settings in LightNet config now look like:

```json
{
  "defaultSiteLanguage": "en",
  "siteLanguages": ["en", "de"],
  "fallbackLanguages": {
    "de": ["en"]
  }
}
```

## Breaking changes

- LightNet config now uses explicit locale settings:
  - `defaultSiteLanguage: string`
  - `siteLanguages: string[]`
  - `fallbackLanguages: Record<string, string[]>`
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
  "defaultSiteLanguage": "en",
  "siteLanguages": ["en"],
  "fallbackLanguages": {}
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

3. If your code imports `resolveDefaultLocale` from `lightnet/i18n`, remove that import and rely on current locale/default locale from `Astro.locals.i18n`.
