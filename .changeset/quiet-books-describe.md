---
"lightnet": minor
"@lightnet/sveltia-admin": minor
---

Add an optional `schemaType` field to media types, supporting `CreativeWork`, `Book`, `Article`, `DigitalDocument`, `AudioObject`, `VideoObject`, and `ImageObject`. Explicit types determine the main JSON-LD type independently of the page layout, while audio, video, and document files retain their own types. Omitting the field preserves automatic inference. The field is also available in the admin interface.
