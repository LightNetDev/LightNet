---
lightnet: major
---

LightNet config now requires a `site` URL to define the canonical site domain. This is aligned with Astro `site`, and LightNet validates consistency when both are set.

Behavior summary:

- If LightNet `site` is empty and Astro `site` is set, LightNet uses Astro `site`.
- If both are set, values must be exactly equal.
- If only LightNet `site` is set, LightNet writes it to Astro `site`.
- If neither is set, config validation fails.

## Breaking changes

- A site URL is now required through LightNet config and/or Astro config.
- Mismatched LightNet `site` and Astro `site` now fail fast.

## Migration

Set `site` in your LightNet config (recommended), or ensure Astro `site` is present and matches.

```json
// lightnet.config.json
{
  "site": "https://example.org",
  "title": { "en": "Example Library" },
  "defaultSiteLanguage": "en",
  "siteLanguages": ["en"]
}
```

If you keep both values, ensure they are identical.

```ts
// astro.config.ts
export default defineConfig({
  site: "https://example.org",
  integrations: [
    lightnet({
      site: "https://example.org",
    }),
  ],
})
```
