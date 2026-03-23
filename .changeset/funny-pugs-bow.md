---
"lightnet": patch
---

Strip the Astro `base` path before resolving the current locale from the URL pathname so localized pages render with the correct site language under deployments like `/docs/de/...`.
