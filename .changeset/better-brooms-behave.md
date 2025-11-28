---
"lightnet": patch
---

Tighten locale detection to avoid partial matches

When the URL path starts with a locale-like prefix, only full segment matches should be treated as a locale. Previously `/enx` was parsed as locale `en`; now only `/en/...` (or just `/en`) will match.
