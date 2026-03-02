---
"lightnet": major
---

Reverse media collection ownership from `media[].collections` to `media-collections[].mediaItems`.

## Breaking changes

- `media` entries no longer support the `collections` field.
- `media-collections` entries now define membership and order through a new `mediaItems` field.
- Collection order is now defined by array order in `media-collections/<id>.json`.

## Migration

Move collection references from each media item into each media collection.

Before (`src/content/media/my-book--en.json`):

```json
{
  "title": "My book",
  "collections": [
    { "collection": "learn-series" },
    { "collection": "featured", "index": 2 }
  ]
}
```

After (`src/content/media/my-book--en.json`):

```json
{
  "title": "My book"
}
```

After (`src/content/media-collections/learn-series.json`):

```json
{
  "label": { "en": "Learn Series" },
  "mediaItems": ["my-book--en", "another-item--en"]
}
```

If you previously used per-item `index`, convert that ordering into the `mediaItems` array order.
