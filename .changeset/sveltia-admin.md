---
"@lightnet/sveltia-admin": major
---

Add an experimental LightNet administration UI based on Sveltia CMS.

This replaces the previous experimental Decap-based administration UI
(`@lightnet/decap-admin`) with a Sveltia-based integration.

## Migration notes

- Replace imports from `@lightnet/decap-admin` with `@lightnet/sveltia-admin`.
- Remove the `languages` option from admin integration config. Sveltia admin
  now resolves languages from the LightNet site config.
