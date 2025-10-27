---
"lightnet": patch
---

Astro 5.14.8 resolves relative image paths like `image/my-image.jpg` without a `./` prefix, so remove the manual prefixing in `packages/lightnet/src/content/astro-image.ts`. See [Astro's release notes for version 5.14.8](https://github.com/withastro/astro/releases/tag/astro%405.14.8).
