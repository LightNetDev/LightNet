---
"lightnet": patch
---

Validate inline translation maps in LightNet config at the top level against configured site locales.

This now enforces locale completeness for:

- `title`
- `languages[].label`
- `mainMenu[].label`
- `logo.alt`

Each missing site-locale entry now surfaces a path-specific schema error.
