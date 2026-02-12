/// <reference path="../i18n/locals.d.ts" />
import react from "@astrojs/react"
import tailwind from "@astrojs/tailwind"
import type { AstroIntegration } from "astro"

import { resolveDefaultLocale } from "../i18n/resolve-default-locale"
import { resolveLocales } from "../i18n/resolve-locales"
import { verifySchema } from "../utils/verify-schema"
import { configSchema, type LightnetConfig } from "./config"
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
        const config = verifySchema(
          configSchema,
          lightnetConfig,
          "Invalid LightNet configuration",
          "Fix these errors on the LightNet configuration inside astro.config.mjs:",
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
          vite: {
            plugins: [vitePluginLightnetConfig(config, astroConfig, logger)],
          },
          i18n: {
            defaultLocale: resolveDefaultLocale(config),
            locales: resolveLocales(config),
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
