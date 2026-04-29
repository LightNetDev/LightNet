import { z } from "astro/zod"

import { isBcp47 } from "../i18n/bcp-47"
export { inlineTranslationSchema } from "../i18n/inline-translation-schema"
import { inlineTranslationSchema } from "../i18n/inline-translation-schema"
import { validateInlineTranslations } from "./validators/validate-inline-translations"
import { validateLanguages } from "./validators/validate-languages"

/**
 * Link Schema.
 */
const linkSchema = z.object({
  /**
   * Address this should link to.
   * Can either be a path like "/about" or a full
   * url, like "https://your-ministry.com".
   */
  href: z.string(),
  /**
   * Label to be used for the link.
   * Must define a value for the default site locale.
   * Other configured site locales are optional.
   */
  label: inlineTranslationSchema,
  /**
   * If this is set to true the currentLocale will be appended to
   * the href path. Eg. for href="/about"
   * the resolved value will be "/en/about" if the current locale is "en".
   *
   * This option will be ignored if the path is a external url.
   *
   * Default is true.
   */
  requiresLocale: z.boolean().default(true),
})

const bcp47Schema = z.string().refine(isBcp47, {
  message: "Invalid BCP-47 language code",
})

const languageSchema = z
  .object({
    /**
     * BCP-47 code for this language.
     */
    code: bcp47Schema,
    /**
     * Display name for this language.
     */
    label: inlineTranslationSchema,
    /**
     * Whether this language should be exposed as a site UI language.
     */
    isSiteLanguage: z.boolean().default(false),
    /**
     * Whether this language is the default site language.
     */
    isDefaultSiteLanguage: z.boolean().default(false),
    /**
     * Ordered fallback language codes used when a translation key is missing.
     */
    fallbackLanguages: z.array(bcp47Schema).default([]),
  })
  .transform((language) => ({
    ...language,
    isSiteLanguage: language.isDefaultSiteLanguage || language.isSiteLanguage,
  }))

const absolutePath = (path: string) =>
  `${path.startsWith("/") ? "" : "/"}${path}`

/**
 * This API for setting a favicon uses the
 * HTML standard attributes.
 *
 * @see https://en.wikipedia.org/wiki/Favicon
 *
 * We automatically infer the "type" of the icon. So you
 * do not have to set this.
 */
const faviconSchema = z.object({
  /**
   * Reference the favicon. This must be a path to an image in the `public/` directory.
   *
   * @example "/favicon.svg"
   */
  href: z.string().transform(absolutePath),
  /**
   * See HTML standard.
   */
  rel: z.enum(["icon", "apple-touch-icon"]).default("icon"),
  /**
   * See HTML standard.
   */
  sizes: z.string().optional(),
})

/**
 * LightNet Config Schema.
 */
export const configSchema = z.object({
  /**
   * Title of the web site.
   */
  title: inlineTranslationSchema,
  /**
   * Languages supported by this site.
   */
  languages: z.array(languageSchema).min(1).superRefine(validateLanguages),
  /**
   * Favicons for your site.
   */
  favicon: faviconSchema.array().optional(),
  /**
   * Enable displaying a “Powered by LightNet” link in your site’s footer.
   */
  credits: z.boolean().default(false),
  /**
   * Link to manifest file within public/ folder
   */
  manifest: z.string().transform(absolutePath).optional(),
  /**
   * Logo to be used for the header.
   */
  logo: z
    .object({
      /**
       * Path to a logo based in the /src/assets folder.
       * We recommend a size of at least 150x150px. The logo
       * will be optimized for performance.
       *
       * @example "/src/assets/your-logo.png"
       */
      src: z.string(),
      /**
       * Alt attribute to add for screen reader etc.
       * Must define a value for the default site locale.
       * Other configured site locales are optional.
       */
      alt: inlineTranslationSchema.optional(),
      /**
       * Size in px to use for the logo on the header bar.
       * The size will be applied to the shorter side of your logo image.
       *
       * Default is 28 px.
       */
      size: z.number().default(28),
      /**
       * Do not show the site title next to the logo.
       * Set this to `true` if your logo already contains the title.
       */
      replacesTitle: z.boolean().default(false),
    })
    .optional(),
  /**
   * Main menu structure.
   */
  mainMenu: z.array(linkSchema).min(1).optional(),
  /**
   * The internalDomains configuration setting specifies a list of
   * domain names that should be treated as internal.
   *
   * This setting is useful for bypassing external-link handling or marking
   * trusted domains as internal resources.
   *
   * @notes
   * - Domains are matched exactly as listed; wildcard or regex patterns are not supported.
   * - Ensure that only trusted and necessary domains are included in this list.
   */
  internalDomains: z.array(z.string()).default([]),
  /**
   * Path to an Astro component to be added into the HTML head element of all pages.
   * For example use this if you need to add an analytics script to every page.
   *
   * @example "./src/components/MyHeadTag.astro"
   */
  headComponent: z.string().optional(),
  /**
   * Path to an Astro component to be added at the bottom of all pages.
   *
   * @example "./src/components/MyFooter.astro"
   */
  footerComponent: z.string().optional(),
  /**
   * Configure search page behavior
   */
  searchPage: z
    .object({
      /**
       * Set this to true, to initially filter search results by current site language.
       * The filter will only be set when there is any media item in the site language.
       */
      filterByLocale: z.boolean().default(false),
      /**
       * Set this to true, to remove the search magnifier icon from the header bar.
       */
      hideHeaderSearchIcon: z.boolean().default(false),
    })
    .optional(),
  /**
   * Experimental features. Subject to change with any release.
   */
  experimental: z.object({}).optional(),
})

export const extendedConfigSchema = configSchema.transform((config, ctx) => {
  const locales = config.languages
    .filter((language) => language.isSiteLanguage)
    .map((language) => language.code)
  const defaultLocale =
    config.languages.find((language) => language.isDefaultSiteLanguage)?.code ??
    ""

  validateInlineTranslations(config, locales, defaultLocale, ctx)

  return {
    ...config,
    locales,
    defaultLocale,
  }
})

export type Link = z.input<typeof linkSchema>
export type Language = z.input<typeof languageSchema>

export type LightnetConfig = z.input<typeof configSchema>
export type ExtendedLightnetConfig = z.output<typeof extendedConfigSchema>
