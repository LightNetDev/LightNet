import preact from "@astrojs/preact"
import tailwind from "@astrojs/tailwind"
import type { AstroIntegration } from "astro"

import type { Config } from "./config"
import { vitePluginLightnetConfig } from "./vite-plugin-lightnet-config"

export function lightnet(lightnetConfig: Config): AstroIntegration {
  return {
    name: "@lightnet/library",
    hooks: {
      "astro:config:setup": ({ injectRoute, config, updateConfig }) => {
        injectRoute({
          pattern: "404",
          entrypoint: "@lightnet/library/pages/404.astro",
          prerender: true,
        })

        injectRoute({
          pattern: "/[locale]/media",
          entrypoint: "@lightnet/library/pages/SearchPage.astro",
          prerender: true,
        })

        injectRoute({
          pattern: "/api/search.json",
          entrypoint: "@lightnet/library/pages/api/search.ts",
          prerender: true,
        })

        injectRoute({
          pattern: "/[locale]/media/[slug]",
          entrypoint: "@lightnet/library/pages/DetailsPage.astro",
          prerender: true,
        })

        config.integrations.push(tailwind(), preact())

        updateConfig({
          vite: {
            plugins: [vitePluginLightnetConfig(lightnetConfig, config)],
          },
          i18n: {
            defaultLocale: lightnetConfig.defaultLocale,
            locales: lightnetConfig.locales,
          },
        })
      },
    },
  }
}
