---
"@lightnet/cli": minor
"lightnet": minor
---

Add translation discovery support for build-driven export and validation workflows.

LightNet now records normalized translation discovery artifacts during builds when
`LIGHTNET_TRANSLATION_DISCOVERY=1` is enabled internally by the CLI. This
includes built-in translations, user translation YAML files, and inline
translation maps discovered from LightNet-owned config and content data.

The new public `@lightnet/cli` package adds:

- `lightnet-cli translations export <locale>`
- `lightnet-cli translations validate`

These commands run an Astro build through the site's package manager, read the
generated discovery artifacts, and output either flat YAML export data or a
missing-translation summary.
