/// <reference path="../i18n/locals.d.ts" />
import react from "@astrojs/react"
import tailwind from "@astrojs/tailwind"
import type { AstroIntegration } from "astro"
import { AstroError } from "astro/errors"

import { verifySchema } from "../utils/verify-schema"
import { extendedConfigSchema, type LightnetConfig } from "./config"
import { vitePluginLightnetConfig } from "./vite-plugin-lightnet-config"

export function lightnet(
  lightnetConfig: Partial<LightnetConfig>,
): AstroIntegration {
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
        const config = verifySchema(
          extendedConfigSchema,
          lightnetConfig,
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

        if (astroConfig.site) {
          throw new AstroError(
            "Conflicting site configuration",
            "Remove `site` from `astro.config.*` and set `siteUrl` in the LightNet config instead.",
          )
        }

        updateConfig({
          site: config.siteUrl,
          vite: {
            plugins: [vitePluginLightnetConfig(config, astroConfig, logger)],
          },
          i18n: {
            defaultLocale: config.defaultLocale,
            locales: config.locales,
            routing: {
              redirectToDefaultLocale: false,
              // We need to set this to false to allow for
              // admin paths without locale. But actually
              // the default locale will be prefixed for regular
              // LightNet pages.
              prefixDefaultLocale: false,
              fallbackType: "rewrite",
            },
          },
        })
      },
    },
  }
}
