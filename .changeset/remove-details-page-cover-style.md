---
"lightnet": major
---

Deprecated `media-types.detailsPage.coverStyle` support was removed. Cover styling now belongs at top-level `coverImageStyle`.

## Breaking changes

- `detailsPage.coverStyle` is no longer supported.
- Automatic schema migration from `detailsPage.coverStyle` to `coverImageStyle` was removed.

## Migration

Move cover style values to top-level `coverImageStyle` in each media type file.

```json
// before
{
  "detailsPage": {
    "layout": "default",
    "coverStyle": "book"
  }
}

// after
{
  "coverImageStyle": "book",
  "detailsPage": {
    "layout": "default"
  }
}
```
