---
lightnet: major
---

`astro.config.*` `site` is no longer supported when using LightNet.

`siteUrl` is now required in the LightNet config and is the single source of truth for the site URL.

To migrate:

1. Remove `site` from `astro.config.*`.
2. Set `siteUrl` in `lightnet({ ... })`.

Example:

```ts
// before
export default defineConfig({
  site: "https://example.org",
  integrations: [
    lightnet({
      /* ... */
    }),
  ],
})

// after
export default defineConfig({
  integrations: [
    lightnet({
      siteUrl: "https://example.org",
      // ...
    }),
  ],
})
```
