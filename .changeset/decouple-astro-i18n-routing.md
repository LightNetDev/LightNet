---
"lightnet": major
---

Decouple LightNet from Astro `i18n` routing auto-configuration.

## Breaking change (`lightnet`)

LightNet no longer writes Astro `i18n` config (`locales`, `defaultLocale`, `routing`) during integration setup.
Locale-aware logic now resolves through `Astro.locals.i18n.currentLocale` instead of `Astro.currentLocale`.

## Migration

1. In LightNet pages and components, replace `Astro.currentLocale` with `Astro.locals.i18n.currentLocale`.
2. If your project depends on Astro `i18n` for non-LightNet routes or utilities, define `i18n` explicitly in your own `astro.config.*`.

Use a config like this to keep the previous routing behavior:

```
i18n: {
  defaultLocale: "en", // your default site locale
  locales: ["en", "de"], // all supported site locales
  routing: {
    redirectToDefaultLocale: false,
    prefixDefaultLocale: true,
    fallbackType: "rewrite",
  },
},
```
