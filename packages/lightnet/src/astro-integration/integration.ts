/// <reference path="../i18n/locals.d.ts" />
import react from "@astrojs/react"
import type { AstroIntegration } from "astro"
import { AstroError } from "astro/errors"

import {
  discoverBuildTranslations,
  discoverConfigTranslations,
} from "../i18n/discover-translations"
import { initializeTranslationDiscovery } from "../i18n/record-translation"
import { verifySchema } from "../utils/verify-schema"
import { extendedConfigSchema, type LightnetConfig } from "./config"
import tailwind from "./tailwind"
import { vitePluginLightnetConfig } from "./vite-plugin-lightnet-config"

export function lightnet(lightnetConfig: LightnetConfig): AstroIntegration {
  return {
    name: "lightnet",
    hooks: {
      "astro:config:setup": async ({
        injectRoute,
        config: astroConfig,
        updateConfig,
        logger,
        addMiddleware,
      }) => {
        if (!astroConfig.site) {
          throw new AstroError(
            "Invalid LightNet configuration",
            "Set `site` in your Astro config. LightNet requires Astro `site` to be configured.",
          )
        }

        const config = verifySchema(
          extendedConfigSchema,
          lightnetConfig,
          "Invalid LightNet configuration",
          "Fix these errors on the LightNet configuration:",
        )
        await initializeTranslationDiscovery({
          defaultLocale: config.defaultLocale,
          locales: config.locales,
        })
        discoverConfigTranslations(config)

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

        updateConfig({
          integrations: [tailwind(), react()],
          vite: {
            plugins: [vitePluginLightnetConfig(config, astroConfig, logger)],
          },
        })
      },
      "astro:build:start": async () => {
        const config = verifySchema(
          extendedConfigSchema,
          lightnetConfig,
          "Invalid LightNet configuration",
          "Fix these errors on the LightNet configuration:",
        )

        await initializeTranslationDiscovery({
          defaultLocale: config.defaultLocale,
          locales: config.locales,
        })
        await discoverBuildTranslations(config)
      },
    },
  }
}
