---
"@lightnet/sveltia-admin": patch
---

Serve the development admin as plain HTML loading Sveltia from the CDN, pinned to the installed npm package version, to prevent reloads from interrupting local saves. Keep normal Astro bundling in production and preserve custom admin paths and Astro base paths without requiring files in the site's public directory.
