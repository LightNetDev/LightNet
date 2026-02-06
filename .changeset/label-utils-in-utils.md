---
"lightnet": minor
---

Export `fixedLabel` and `translatedLabel` from `lightnet/utils`.

`fixedLabel(text)` creates a `{ type: "fixed", text }` label that bypasses translation.
`translatedLabel(key)` creates a `{ type: "translated", key }` label that is resolved via i18n.
