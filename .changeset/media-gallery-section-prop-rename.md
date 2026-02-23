---
"lightnet": major
---

Rename `MediaGallerySection` props and update layout defaults.

## Breaking changes

- `MediaGallerySection` prop `layout` has been renamed to `itemWidth`.
  - Old values `"book" | "video" | "portrait" | "landscape"` are removed.
  - New values are `"narrow" | "wide"`.
- `MediaGallerySection` prop `viewLayout` has been renamed to `layout`.
- Default `MediaGallerySection.layout` is now `"carousel"` (previously `viewLayout` defaulted to `"grid"`).
- `MediaGallerySection` no longer supports the old `layout` and `viewLayout` prop names.

## Migration

Update your `MediaGallerySection` usage:

```astro
<!-- before -->
<MediaGallerySection items={items} layout="book" viewLayout="grid" />

<!-- after -->
<MediaGallerySection items={items} itemWidth="narrow" layout="grid" />
```

`coverImageStyle` is now always sourced from the media type configuration for each item.
