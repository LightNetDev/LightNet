---
"lightnet": major
---

Restructure LightNet config to support split file loading and locale-keyed language config.

## Breaking changes

- `languages` must now be an object keyed by BCP-47 locale code, not an array with `code` fields.
- Translation data is now expected in `config.translations` (directly or via `loadConfig()`), instead of being implicitly consumed from runtime translation files.
- `resolveDefaultLocale` is no longer exported from `lightnet/i18n`.

## New

- Export `loadConfig()` from `lightnet` to load and merge config from:
  - `/src/config/*.json`
  - `/src/config/languages/*.json`
  - `/src/translations/*.(yml|yaml)`
  - `/src/config/translations/*.(yml|yaml)`

## Migration example

```js
// before
import lightnet from "lightnet"

export default defineConfig({
  integrations: [
    lightnet({
      languages: [
        { code: "en", label: { en: "English" }, isDefaultSiteLanguage: true },
        { code: "de", label: { en: "Deutsch" }, isSiteLanguage: true },
      ],
      // translations were typically read from /src/translations/*.yml
    }),
  ],
})

// after
import lightnet, { loadConfig } from "lightnet"

export default defineConfig({
  integrations: [
    lightnet({
      ...(await loadConfig()),
      languages: {
        en: { label: { en: "English" }, isDefaultSiteLanguage: true },
        de: { label: { en: "Deutsch" }, isSiteLanguage: true },
      },
      // translations now flow through config.translations
      // (loadConfig() collects from /src/translations and /src/config/translations)
    }),
  ],
})
```
