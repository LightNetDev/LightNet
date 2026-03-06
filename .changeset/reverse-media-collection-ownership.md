---
"lightnet": major
---

Collection ownership was reversed from `media[].collections` to `media-collections[].mediaItems`. Collections now own membership and order directly.

## Breaking changes

- `media` entries no longer support the `collections` field.
- `media-collections` entries now define membership using `mediaItems`.
- Collection ordering is now defined by the order of IDs in `mediaItems`.

## Migration

1. Remove `collections` from each media item.

```json
// before: src/content/media/my-book--en.json
{
  "title": "My book",
  "collections": [
    { "collection": "learn-series" },
    { "collection": "featured", "index": 2 }
  ]
}

// after
{
  "title": "My book"
}
```

2. Add media membership and order to each media collection.

```json
// src/content/media-collections/learn-series.json
{
  "label": { "en": "Learn Series" },
  "mediaItems": ["my-book--en", "another-item--en"]
}
```

If you previously used per-item `index`, convert that ordering into `mediaItems` array order.
