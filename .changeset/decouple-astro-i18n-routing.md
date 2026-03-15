---
"lightnet": major
---

LightNet no longer injects Astro `i18n` routing config during integration setup. Locale-aware code should now read the active locale from `Astro.locals.i18n.currentLocale`.

## Breaking changes

- LightNet no longer configures Astro `i18n` (`locales`, `defaultLocale`, `routing`) for you.
- Code paths using `Astro.currentLocale` must switch to `Astro.locals.i18n.currentLocale`.

## Migration

1. Update locale access in pages and components.

```astro
---
// before
const locale = Astro.currentLocale

// after
const locale = Astro.locals.i18n.currentLocale
---
```

2. If your project relies on Astro `i18n` routing, define it explicitly in `astro.config.*`.

This is the Astro `i18n` config LightNet used to generate:

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
