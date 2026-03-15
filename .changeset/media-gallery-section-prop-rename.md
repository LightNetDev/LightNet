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
- `itemWidth` now supports `"infer" | "narrow" | "wide"` and defaults to `"infer"`.
- `viewLayout` was renamed to `layout`.
- Default layout is now `"carousel"`.
- Old prop names `layout` (style meaning) and `viewLayout` are no longer supported.
- `itemWidth="infer"` uses the first 10 media items to choose a width:
  - more landscape images (`width > height`) => `"wide"`
  - otherwise => `"narrow"`

## Migration

Update component usage to the new prop names and values.

```astro
<!-- before -->
<MediaGallerySection items={items} layout="book" viewLayout="grid" />

<!-- after -->
<MediaGallerySection items={items} itemWidth="narrow" layout="grid" />

<!-- after (explicit inferred width, default behavior) -->
<MediaGallerySection items={items} itemWidth="infer" layout="grid" />
```

`coverImageStyle` is now sourced from each media type configuration.
