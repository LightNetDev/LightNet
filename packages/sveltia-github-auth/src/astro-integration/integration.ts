import cloudflare from "@astrojs/cloudflare"
import type { AstroIntegration } from "astro"
import { AstroError } from "astro/errors"

export interface SveltiaGithubAuthOptions {
  /** Path to a Wrangler configuration, relative to the Astro project root. */
  configPath?: string
}

export default function sveltiaGithubAuth(
  options: SveltiaGithubAuthOptions = {},
): AstroIntegration {
  return {
    name: "@lightnet/sveltia-github-auth",
    hooks: {
      "astro:config:setup": ({ config, injectRoute, updateConfig }) => {
        if (config.adapter && config.adapter.name !== "@astrojs/cloudflare") {
          throw new AstroError(
            "Invalid Sveltia GitHub auth adapter",
            "@lightnet/sveltia-github-auth requires the Cloudflare adapter. Remove the other adapter from your Astro configuration.",
          )
        }

        if (!config.adapter) {
          const adapter = cloudflare({
            configPath: options.configPath,
            prerenderEnvironment: "node",
          })
          updateConfig({
            adapter,
            // Astro registers the configured adapter before setup hooks run.
            // Adding it here also registers its hooks for this config cycle.
            integrations: [adapter],
          })
        }

        injectRoute({
          pattern: "/api/sveltia-github-auth/test",
          entrypoint: "@lightnet/sveltia-github-auth/test.ts",
          prerender: false,
        })
      },
    },
  }
}
