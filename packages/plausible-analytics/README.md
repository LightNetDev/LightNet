# @lightnet/plausible-analytics

Plausible Analytics integration for LightNet sites.

This package injects the Plausible tracker into your Astro site and only
initializes it on pages where LightNet enables tracking.

## Install

```bash
npm install @lightnet/plausible-analytics
```

## Usage

Add the integration to your `astro.config.mjs` or `astro.config.ts`:

```ts
import { defineConfig } from "astro/config"
import lightnet from "@lightnet/lightnet"
import plausibleAnalytics from "@lightnet/plausible-analytics"

export default defineConfig({
  site: "https://example.com",
  integrations: [lightnet(), plausibleAnalytics()],
})
```

The integration derives the Plausible `domain` option from your
`astro.config.site` value, so `site` must be set.

## Configuration

You can pass Plausible tracker options when registering the integration:

```ts
plausibleAnalytics({
  fileDownloads: true,
  outboundLinks: true,
  formSubmissions: false,
})
```

Supported options:

| Option            | Type      | Default | Description                |
| ----------------- | --------- | ------- | -------------------------- |
| `fileDownloads`   | `boolean` | `true`  | Track file download events |
| `outboundLinks`   | `boolean` | `true`  | Track outbound link clicks |
| `formSubmissions` | `boolean` | `false` | Track form submissions     |

## Tracking control

This integration respects LightNet's page-level tracking attribute.

By default, LightNet's `Page` layout renders `data-ln-should-track` on the root
`html` element, and Plausible is initialized only when that attribute is
present.

To disable tracking for a specific page, pass `disableShouldTrack` to the
LightNet page layout:

```astro
---
import Page from "@lightnet/lightnet/layouts/Page.astro"
---

<Page title="Private page" disableShouldTrack>
  <p>This page will not initialize Plausible.</p>
</Page>
```
