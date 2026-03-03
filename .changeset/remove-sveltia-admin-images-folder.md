---
"@lightnet/sveltia-admin": major
---

The `imagesFolder` option was removed from `@lightnet/sveltia-admin`. Media item images now always resolve from the content-adjacent `images` folder.

## Breaking changes

- `imagesFolder` is no longer a valid integration option.
- Passing `imagesFolder` now throws during Astro integration setup.

## Migration

1. Remove `imagesFolder` from your `lightnetSveltiaAdmin(...)` config.

```ts
// before
lightnetSveltiaAdmin({
  imagesFolder: "_images",
})

// after
lightnetSveltiaAdmin({})
```

2. Ensure content image folders are named `images`.

```text
# before
src/content/media/_images/

# after
src/content/media/images/
```
