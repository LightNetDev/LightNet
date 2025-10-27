---
"lightnet": patch
---

Remove the unsupported `maxWidth` option from `MediaGallerySection` and `CategoriesSection`.

The option never worked correctly, but our docs previously only mentioned that in a note. Tighten the typings and runtime guardrails so that consumers see explicit feedback instead of misconfiguring the component.
