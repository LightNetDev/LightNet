---
"lightnet": minor
---

LightNet no longer depends on `@astrojs/tailwind`. That integration was previously needed to support Tailwind CSS v3, but Astro v6 no longer supports Tailwind CSS v3 through `@astrojs/tailwind`. LightNet now provides a built-in Tailwind implementation instead.

Reference:

https://github.com/withastro/astro/issues/15824

## Migration

If your site still lists `@astrojs/tailwind` in its `package.json`, remove it from your dependencies.
