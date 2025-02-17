// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../i18n/locals.d.ts" />
import react from "@astrojs/react"
import tailwind from "@astrojs/tailwind"
import type { AstroIntegration } from "astro"

import { resolveDefaultLocale } from "../i18n/resolve-default-locale"
import { resolveLocales } from "../i18n/resolve-locales"
import type { LightnetConfig } from "./config"
import { vitePluginLightnetConfig } from "./vite-plugin-lightnet-config"

export function lightnet(lightnetConfig: LightnetConfig): AstroIntegration {
  return {
    name: "lightnet",
    hooks: {
      "astro:config:setup": ({
        injectRoute,
        config,
        updateConfig,
        logger,
        addMiddleware,
      }) => {
        injectRoute({
          pattern: "404",
          entrypoint: "lightnet/pages/404.astro",
          prerender: true,
        })

        injectRoute({
          pattern: "",
          entrypoint: "lightnet/pages/RedirectToDefaultLocale.astro",
          prerender: true,
        })

        injectRoute({
          pattern: "/[locale]/media",
          entrypoint: "lightnet/pages/SearchPage.astro",
          prerender: true,
        })

        injectRoute({
          pattern: "/api/search.json",
          entrypoint: "lightnet/pages/api/search.ts",
          prerender: true,
        })

        injectRoute({
          pattern: "/[locale]/media/[slug]",
          entrypoint: "lightnet/pages/DetailsPage.astro",
          prerender: true,
        })

        addMiddleware({ entrypoint: "lightnet/locals", order: "pre" })

        config.integrations.push(tailwind(), react())

        updateConfig({
          vite: {
            plugins: [vitePluginLightnetConfig(lightnetConfig, config, logger)],
          },
          i18n: {
            defaultLocale: resolveDefaultLocale(lightnetConfig),
            locales: resolveLocales(lightnetConfig),
            routing: {
              redirectToDefaultLocale: false,
              prefixDefaultLocale: false,
              fallbackType: "rewrite",
            },
          },
        })
      },
    },
  }
}
