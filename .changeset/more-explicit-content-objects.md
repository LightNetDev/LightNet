---
"lightnet": major
---

Introduce a discriminated media content item schema with explicit `type` for each entry.

## Breaking change (`lightnet`)

Media item `content` entries must now use:

- `{ "type": "upload", "url": "/files/example.pdf", "label"?: ... }`
- `{ "type": "link", "url": "https://example.com/file.pdf", "label"?: ... }`

The previous implicit shape `{ "url": ..., "label"?: ... }` is no longer accepted.

Use **upload** for file uploads your LightNet site controls, use **link** for web links that you do not control.
