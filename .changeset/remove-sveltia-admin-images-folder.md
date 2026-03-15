---
"@lightnet/sveltia-admin": major
---

The `imagesFolder` option was removed from `@lightnet/sveltia-admin`. Image fields now always use the content-adjacent `images` directory.

## Breaking changes

- `imagesFolder` is no longer a valid integration option.
- Passing `imagesFolder` now throws during Astro integration setup.
- Sveltia image upload paths are fixed to `images`.

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

2. Rename media item image folder to `src/content/media/images` if needed.

```text
# before
src/content/media/_images/
src/content/categories/_images/

# after
src/content/media/images/
src/content/categories/images/
```

3. Update image paths in media item content entries.

```json
// before
{
  "image": "./_images/my-image.jpg"
}
// after
{
  "image": "./images/my-image.jpg"
}
```
