import astroSitemap from "@astrojs/sitemap"
import type { AstroConfig, AstroIntegration } from "astro"

import type { ExtendedLightnetConfig } from "./config"

export const sitemap = (
  lightnetConfig: ExtendedLightnetConfig,
  astroConfig: AstroConfig,
): AstroIntegration[] => {
  if (
    astroConfig.integrations.some(({ name }) => name === "@astrojs/sitemap")
  ) {
    return []
  }

  let adminRoutePatterns: RegExp[] = []

  return [
    {
      name: "lightnet/sitemap-exclusions",
      hooks: {
        "astro:routes:resolved": ({ routes }) => {
          // Astro resolves the package entrypoint to its source file, including
          // workspace paths when the admin package is linked locally.
          adminRoutePatterns = routes
            .filter(({ entrypoint }) =>
              /(?:^|\/)sveltia-admin\/src\/Admin\.astro$/.test(entrypoint),
            )
            .map(({ patternRegex }) => patternRegex)
        },
      },
    },
    astroSitemap({
      filter: (page) =>
        !adminRoutePatterns.some((pattern) =>
          pattern.test(new URL(page).pathname),
        ),
      i18n: {
        defaultLocale: lightnetConfig.defaultLocale,
        locales: Object.fromEntries(
          lightnetConfig.locales.map((locale) => [locale, locale]),
        ),
      },
    }),
  ]
}
