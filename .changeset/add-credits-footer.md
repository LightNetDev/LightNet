---
"lightnet": minor
---

Add optional LightNet credits footer

- Adds `credits: boolean` to LightNet config to show a “Built with LightNet” footer; default is `false`
- Footer includes LightNet logo/text and appears when no `CustomFooter` is provided
- Adds i18n key `ln.footer.powered-by-lightnet` (English provided)
- Enable via `astro.config.mjs`, lightnet config: `credits: true` (PR #315)
