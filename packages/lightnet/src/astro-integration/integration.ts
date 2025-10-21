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
        command,
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

        injectRoute({
          pattern: "/api/media/[mediaId].json",
          entrypoint: "lightnet/api/media/[mediaId].ts",
          prerender: true,
        })

        if (config.experimental?.admin?.enabled) {
          injectRoute({
            pattern: "/[locale]/admin",
            entrypoint: "lightnet/admin/pages/AdminRoute.astro",
            prerender: true,
          })
          injectRoute({
            pattern: "/[locale]/admin/media/edit",
            entrypoint: "lightnet/admin/pages/media/EditRoute.astro",
            prerender: true,
          })
        }

        // During local development admin ui can use
        // this endpoints to write files.
        if (config.experimental?.admin?.enabled && command === "dev") {
          injectRoute({
            pattern: "/api/internal/fs/writeText",
            entrypoint: "lightnet/api/internal/fs/writeText.ts",
            prerender: false,
          })
          // Add empty adapter to avoid warning
          // about missing adapter.
          // This hack might break in the future :(
          // We could also set the "node" adapter if no
          // adapter has been set by user.
          if (!astroConfig.adapter) {
            updateConfig({ adapter: {} })
          }
        }

        addMiddleware({ entrypoint: "lightnet/locals", order: "pre" })

        astroConfig.integrations.push(tailwind(), react())

        updateConfig({
          vite: {
            plugins: [vitePluginLightnetConfig(config, astroConfig, logger)],
          },
          i18n: {
            defaultLocale: resolveDefaultLocale(config),
            locales: resolveLocales(config),
            routing: {
              redirectToDefaultLocale: false,
              prefixDefaultLocale: true,
              fallbackType: "rewrite",
            },
          },
        })
      },
    },
  }
}
