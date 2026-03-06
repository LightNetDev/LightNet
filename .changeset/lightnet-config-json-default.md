---
"lightnet": minor
---

LightNet configuration is now expected by default in a root-level `lightnet.config.json` file, instead of being defined inline in `astro.config.*`.

This enables configuration editing through the administration UI, which reads and writes `lightnet.config.json`.

Behavior summary:

- LightNet config should live in `lightnet.config.json` at project root.
- Existing inline `lightnet(...)` config in `astro.config.*` continues to work.
- Migration is only required if you use `@lightnet/sveltia-admin` config editing.

## Breaking changes

- None.

## Migration

If you do **not** use `@lightnet/sveltia-admin`, no migration is required.

If you use `@lightnet/sveltia-admin`, move LightNet config into `lightnet.config.json` and import it in `astro.config.*`.

```ts
// astro.config.ts
import { defineConfig } from "astro/config"
import lightnet from "lightnet"
import lightnetConfig from "./lightnet.config.json"

export default defineConfig({
  integrations: [lightnet(lightnetConfig)],
})
```
