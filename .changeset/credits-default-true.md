---
"lightnet": major
---

The `credits` option in LightNet config now defaults to `true`. Sites that omit this option will show the "Powered by LightNet" footer by default.

## Breaking changes

- Omitting `credits` now enables credits by default.

## Migration

If you want to keep the previous behavior (no credits by default), set `credits: false` explicitly.

```json
{
  "title": { "en": "My Library" },
  "defaultSiteLanguage": "en",
  "siteLanguages": ["en"],
  "credits": false
}
```
