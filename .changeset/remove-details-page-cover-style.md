---
"lightnet": major
---

Remove deprecated `media-types.detailsPage.coverStyle` support.

## Breaking changes

- `detailsPage.coverStyle` is no longer supported in media type definitions.
- The schema migration that mapped `detailsPage.coverStyle` to `coverImageStyle` has been removed.

## Migration

Move cover styling to top-level `coverImageStyle` in each media type.

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
