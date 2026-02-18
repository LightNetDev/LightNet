---
"lightnet": minor
---

Support user translation keys without the `x.` prefix.

LightNet now resolves user-defined translation keys such as `site.title` and
`home.bbq.title` directly, in addition to existing built-in `ln.*` keys.

This removes the need to namespace user keys with `x.` in project translation
files and template references.
