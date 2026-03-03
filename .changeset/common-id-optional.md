---
"lightnet": patch
"@lightnet/sveltia-admin": patch
---

Make `commonId` optional for media items.

- In `lightnet`, media item schema validation now accepts entries without `commonId`.
- Translation lookup now treats missing `commonId` as standalone and returns no translations for that item.
- In `@lightnet/sveltia-admin`, the `Common ID` field is now optional in the media item editor.
