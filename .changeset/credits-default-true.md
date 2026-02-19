---
"lightnet": major
---

Change `credits` in the LightNet config to default to `true`.

## Breaking changes

- Sites that omit `credits` will now show the "Powered by LightNet" footer by default.

## Migration

Set `credits: false` in your LightNet config if you want to keep the previous behavior.
