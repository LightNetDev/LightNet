---
"lightnet": major
---

LightNet no longer injects Astro `i18n` routing config during setup, and locale-aware code should now use `Astro.locals.i18n.currentLocale`.
