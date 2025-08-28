---
"lightnet": minor
---

`MediaGallerySection`: Added `carousel` layout option

- Introduced a new `viewLayout` prop for `MediaGallerySection`.
- Supported values:
  - `"grid"` (default; existing behavior)
  - `"carousel"` (new; renders items in a horizontal carousel)

- This change is **backwards-compatible**. Existing usages without `viewLayout` will continue to render as a grid.

### Example

```astro
<MediaGallerySection
  title={t("x.home.our-latest-books")}
  items={latestBooks}
  layout="book"
  viewLayout="carousel"
/>
```
