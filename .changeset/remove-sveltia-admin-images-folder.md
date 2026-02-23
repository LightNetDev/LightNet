---
"@lightnet/sveltia-admin": major
---

Remove the `imagesFolder` option from `@lightnet/sveltia-admin` config.

The admin integration now always resolves media item images from the content-adjacent `images` folder.
Passing `imagesFolder` now throws an error during Astro integration setup.

## Migration notes

- Remove `imagesFolder` from `lightnetSveltiaAdmin({ ... })` in `astro.config.*`.
- Media item images now always use the `images` folder next to content files.
- If your project still uses `_images`, rename that folder to `images`.
