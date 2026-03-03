---
"lightnet": major
---

LightNet no longer auto-configures Astro `i18n` routing during integration setup. Locale-aware logic now uses `Astro.locals.i18n.currentLocale`.

## Breaking changes

- LightNet no longer writes Astro `i18n` config (`locales`, `defaultLocale`, `routing`) for you.
- Code paths using `Astro.currentLocale` must switch to `Astro.locals.i18n.currentLocale`.

## Migration

1. Replace locale access in pages/components.

```astro
---
// before
const locale = Astro.currentLocale

// after
const locale = Astro.locals.i18n.currentLocale
---
```

2. If your project depends on Astro `i18n` routing for non-LightNet routes, define it explicitly in `astro.config.*`.

```ts
// astro.config.ts
export default defineConfig({
  i18n: {
    defaultLocale: "en",
    locales: ["en", "de"],
    routing: {
      redirectToDefaultLocale: false,
      prefixDefaultLocale: true,
      fallbackType: "rewrite",
    },
  },
})
```
