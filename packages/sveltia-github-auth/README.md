# @lightnet/sveltia-github-auth

An Astro integration providing a Cloudflare backend for future Sveltia GitHub authentication. GitHub OAuth is not implemented yet.

## Usage

Install `@lightnet/sveltia-github-auth` and add it to your Astro configuration:

```js
import sveltiaGithubAuth from "@lightnet/sveltia-github-auth"
import { defineConfig } from "astro/config"

export default defineConfig({
  integrations: [sveltiaGithubAuth()],
})
```

The integration automatically configures the Cloudflare adapter with Node prerendering and build-time image compilation. Existing pages can remain static. An explicitly configured Cloudflare adapter is preserved; other adapters are unsupported. Requires Astro 6.3 or later in the Astro 6 release line.

For a Wrangler configuration outside your Astro project, pass `sveltiaGithubAuth({ configPath: "../../wrangler.json" })`. The path is relative to the Astro project root and applies when the integration creates the adapter. With an explicit Cloudflare adapter, configure its options directly.

## Test endpoint

`GET /api/sveltia-github-auth/test` returns JSON such as `{"random":0.123}` with `Cache-Control: no-store`. A new random number in `[0, 1)` is generated for every request. The endpoint is public and runs on demand in Cloudflare Workers.

Run `astro dev` to try it locally. Run `astro build` followed by `astro preview` to test the built Worker locally. No GitHub credentials are required.

In this repository, use `pnpm dev`, or `pnpm build` followed by `pnpm preview`, and request `/api/sveltia-github-auth/test` on the displayed local URL. The root `wrangler.json` retains the playground's deployment settings; deploy using the adapter-generated Wrangler configuration after building.
