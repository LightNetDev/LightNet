---
"lightnet": minor
---

Export `fixedLabel` and `translatedLabel` from `lightnet/utils`.

`fixedLabel(value)` creates a `{ type: "fixed", value }` label that bypasses translation.
`translatedLabel(key)` creates a `{ type: "translated", value: key }` label that is resolved via i18n.
