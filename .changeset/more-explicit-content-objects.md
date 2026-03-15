---
"lightnet": major
---

Media item `content` entries now use explicit typed objects so storage intent is clear (`upload` vs `link`).

Examples:

- `{ "type": "upload", "url": "/files/example.pdf", "label"?: ... }`
- `{ "type": "link", "url": "https://example.com/file.pdf", "label"?: ... }`

## Breaking changes

- `content` entries are expected to use explicit `type` values (`upload` or `link`).

## Migration

Update media content entries to include `type`.

```json
// before
{
  "content": [
    { "url": "/files/my-book.pdf", "label": { "en": "Read PDF" } }
  ]
}

// after
{
  "content": [
    {
      "type": "upload",
      "url": "/files/my-book.pdf",
      "label": { "en": "Read PDF" }
    }
  ]
}
```

Use `type: "upload"` for site-managed files and `type: "link"` for external URLs.
