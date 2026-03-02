/// <reference path="../i18n/locals.d.ts" />
import react from "@astrojs/react"
import tailwind from "@astrojs/tailwind"
import type { AstroIntegration } from "astro"
import { AstroError } from "astro/errors"

import { verifySchema } from "../utils/verify-schema"
import { extendedConfigSchema, type LightnetConfig } from "./config"
import { vitePluginLightnetConfig } from "./vite-plugin-lightnet-config"

export function lightnet(lightnetConfig: LightnetConfig): AstroIntegration {
  return {
    name: "lightnet",
    hooks: {
      "astro:config:setup": ({
        injectRoute,
        config: astroConfig,
        updateConfig,
        logger,
        addMiddleware,
      }) => {
        if (
          astroConfig.site &&
          lightnetConfig.site &&
          astroConfig.site !== lightnetConfig.site
        ) {
          throw new AstroError(
            "Conflicting site configuration",
            `LightNet config \`site\` (${lightnetConfig.site}) does not match Astro \`site\` (${astroConfig.site}). Set only one value or make them exactly equal.`,
          )
        }

        const effectiveConfig = {
          ...lightnetConfig,
          site: lightnetConfig.site ?? astroConfig.site,
        }

        const config = verifySchema(
          extendedConfigSchema,
          effectiveConfig,
          "Invalid LightNet configuration",
          "Fix these errors on the LightNet configuration:",
        )

        injectRoute({
          pattern: "404",
          entrypoint: "lightnet/pages/404Route.astro",
          prerender: true,
        })

        injectRoute({
          pattern: "",
          entrypoint: "lightnet/pages/RootRoute.astro",
          prerender: true,
        })

        injectRoute({
          pattern: "/[locale]/media",
          entrypoint: "lightnet/pages/SearchPageRoute.astro",
          prerender: true,
        })

        injectRoute({
          pattern: "/[locale]/media/[mediaId]",
          entrypoint: "lightnet/pages/DetailsPageRoute.astro",
          prerender: true,
        })

        injectRoute({
          pattern: "/api/internal/search.json",
          entrypoint: "lightnet/api/internal/search.ts",
          prerender: true,
        })

        injectRoute({
          pattern: "/api/versions.json",
          entrypoint: "lightnet/api/versions.ts",
          prerender: true,
        })

        addMiddleware({ entrypoint: "lightnet/locals", order: "pre" })

        astroConfig.integrations.push(
          tailwind({ applyBaseStyles: false }),
          react(),
        )

        updateConfig({
          site: config.site,
          vite: {
            plugins: [vitePluginLightnetConfig(config, astroConfig, logger)],
          },
        })
      },
    },
  }
}
