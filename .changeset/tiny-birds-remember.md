---
"lightnet": patch
---

Add `tConfigField` and `tContentField` to LightNet's i18n locals to distinguish
between inline translation maps from config fields and content fields.

These helpers resolve inline translation maps for the current locale while
preserving the existing `tMap` helper for cases where the field context is
provided manually.
