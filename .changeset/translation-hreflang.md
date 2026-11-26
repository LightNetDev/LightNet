---
"lightnet": minor
---

Link translations of a media item for search engines. When search indexing is allowed, details pages add `hreflang` alternate links to all media items that share their `commonId`, and their JSON-LD lists the other translations as `workTranslation`. If media items with the same `commonId` share a language, the alternate links are skipped for that group.
