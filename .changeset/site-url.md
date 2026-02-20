---
lightnet: major
---

LightNet config now requires `site` setting to configure the domain of this site.

This is the same like Astro`s site setting but it is mandatory.
If you have set Astro site. You do not need to change it.

- If LightNet `site` is empty and Astro `site` is set, LightNet uses Astro `site`.
- If both are set, LightNet only fails when they are not exactly equal.
- If only LightNet `site` is set, LightNet writes it to Astro `site`.
- If neither is set, config validation fails.

To migrate:

- Add site setting to LightNet config
