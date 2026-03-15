---
"@lightnet/sveltia-admin": major
---

An experimental LightNet administration UI based on Sveltia CMS was added. This replaces the previous experimental Decap-based admin integration.

## Breaking changes

- `@lightnet/decap-admin` is replaced by `@lightnet/sveltia-admin`.
- The admin integration no longer accepts a `languages` option; languages are resolved from LightNet site config/content.

## Migration

1. Replace package imports.

```ts
// before
import decapAdmin from "@lightnet/decap-admin"

// after
import lightnetSveltiaAdmin from "@lightnet/sveltia-admin"
```

2. Update integration setup and remove `languages` option.

```ts
// before
integrations: [
  decapAdmin({
    languages: ["en", "de"],
  }),
]

// after
integrations: [lightnetSveltiaAdmin({})]
```
