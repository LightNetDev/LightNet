---
"lightnet": major
---

`MediaGallerySection` props were renamed and layout defaults were updated to improve API clarity.

Example updated usage:

```astro
<MediaGallerySection items={items} itemWidth="narrow" layout="grid" />
```

## Breaking changes

- `layout` (old item style prop) was renamed to `itemWidth`.
- Old `layout` values (`"book" | "video" | "portrait" | "landscape"`) were removed.
- `itemWidth` now supports `"narrow" | "wide"` and is optional.
- `viewLayout` was renamed to `layout`.
- Default layout is now `"carousel"`.
- Old prop names `layout` (style meaning) and `viewLayout` are no longer supported.
- If `itemWidth` is not set, it is inferred from the first 10 media items:
  - more landscape images (`width > height`) => `"wide"`
  - otherwise => `"narrow"`

## Migration

Update component usage to the new prop names and values.

```astro
<!-- before -->
<MediaGallerySection items={items} layout="book" viewLayout="grid" />

<!-- after -->
<MediaGallerySection items={items} itemWidth="narrow" layout="grid" />

<!-- after (inferred width) -->
<MediaGallerySection items={items} layout="grid" />
```

`coverImageStyle` is now sourced from each media type configuration.
