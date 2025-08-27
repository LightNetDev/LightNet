---
"lightnet": minor
---

Media type config: Added `coverImageStyle`

- Introduced a new `coverImageStyle` option for media type configuration.
- Controls how cover images are rendered for media items.

Supported values:

- `"default"` — unmodified media item image (default)
- `"book"` — styled as a book cover (book fold, sharper edges)
- `"video"` — forced 16:9 aspect ratio with black background

#### Deprecation Notice

The existing `detailsPage.coverStyle` option is now deprecated and will be removed in a future major release. Use `coverImageStyle` instead.
