---
"@lightnet/sveltia-admin": minor
---

Add an experimental `useLanguagesCollection` option to `sveltiaAdmin(...)` so sites can edit LightNet languages through a root-level `languages.json` file.
To use it, move the `languages` array out of `lightnet(...)` into `languages.json`, import that file back into `astro.config.*`, and enable `experimental.useLanguagesCollection`.
