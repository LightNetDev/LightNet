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

  if (lightnetConfig.disallowSearchIndexing) {
    return []
  }

  let adminRoutePatterns: RegExp[] = []
  let isTranslatedDetailsPage = (_pathname: string) => false

  return [
    {
      name: "lightnet/sitemap-exclusions",
      hooks: {
        "astro:config:done": ({ config }) => {
          isTranslatedDetailsPage = createTranslatedDetailsPageMatcher(
            lightnetConfig,
            config.base,
          )
        },
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
      filter: (page) => {
        const { pathname } = new URL(page)
        return (
          !isTranslatedDetailsPage(pathname) &&
          !adminRoutePatterns.some((pattern) => pattern.test(pathname))
        )
      },
      i18n: {
        defaultLocale: lightnetConfig.defaultLocale,
        locales: Object.fromEntries(
          lightnetConfig.locales.map((locale) => [locale, locale]),
        ),
      },
    }),
  ]
}

/**
 * Details pages declare the default locale version as their canonical URL,
 * because only the interface language differs between locales. Search engines
 * expect sitemaps to list only canonical URLs, so the other locale versions
 * are excluded. This also keeps them out of the sitemap's hreflang alternates.
 */
const createTranslatedDetailsPageMatcher = (
  { defaultLocale, locales }: ExtendedLightnetConfig,
  base: string,
) => {
  const basePath = base.replace(/\/+$/, "")
  const translatedLocales = new Set(
    locales.filter((locale) => locale !== defaultLocale),
  )
  return (pathname: string) => {
    if (!pathname.startsWith(`${basePath}/`)) {
      return false
    }
    const [locale, media, id, ...rest] = pathname
      .slice(basePath.length + 1)
      .split("/")
    return (
      translatedLocales.has(locale) &&
      media === "media" &&
      !!id &&
      rest.join("") === ""
    )
  }
}
