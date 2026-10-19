import astroSitemap from "@astrojs/sitemap"
import type { ExtendedLightnetConfig } from "./config"
import type { AstroConfig } from "astro"

export const sitemap = (
  lightnetConfig: ExtendedLightnetConfig,
  astroConfig: AstroConfig,
) =>
  astroConfig.integrations.some(({ name }) => name === "@astrojs/sitemap")
    ? []
    : [
        astroSitemap({
          i18n: {
            defaultLocale: lightnetConfig.defaultLocale,
            locales: Object.fromEntries(
              lightnetConfig.locales.map((locale) => [locale, locale]),
            ),
          },
        }),
      ]
