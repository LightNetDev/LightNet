---
"lightnet": major
---

Make label fields explicit with `{ type, key/text }` objects and remove the `x.` translation key prefix.

Affected fields:

- Content:
  - Categories: `label`
  - Media collections: `label`
  - Media types: `label`
  - Media item content entries: `content[].label`
- Config:
  - `title`
  - `logo.alt`
  - `languages[].label`
  - `mainMenu[].label`
