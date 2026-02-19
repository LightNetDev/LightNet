---
"lightnet": major
---

Stop auto-configuring Astro `i18n` in the LightNet integration and rely on `Astro.locals.i18n.currentLocale` for locale-aware behavior.

## Breaking changes

- LightNet no longer injects Astro `i18n` config (`locales`, `defaultLocale`, `routing`) during integration setup.
- Internal LightNet components no longer use `Astro.currentLocale`.

## Migration

- In LightNet pages/components, use `Astro.locals.i18n.currentLocale` instead of `Astro.currentLocale`.
- If your project depends on Astro's `i18n` config for non-LightNet routes or utilities, configure Astro `i18n` explicitly in your own `astro.config.*`.
