---
"lightnet": minor
---

LightNet now adds a `data-should-track` attribute to the root `html` element
for `Page` and `MarkdownPage` layouts by default. Analytics integrations can
use this attribute to decide whether a page should be tracked.

You can opt out for an individual page by passing `disableShouldTrack` to
`Page` or `MarkdownPage`. This change does not add analytics on its own; it
only exposes a per-page signal for integrations such as `@lightnet/plausible`.
