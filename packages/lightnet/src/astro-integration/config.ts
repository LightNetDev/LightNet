import { z } from "astro/zod"

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
   * Can either be a translation key or a fixed string.
   */
  label: z.string(),
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

/**
 * Language Schema.
 */
const languageSchema = z
  .object({
    /**
     * IETF BCP-47 language tag for this language.
     *
     * This will be the identifier of this language and will
     * also appear on the URL paths of the website.
     */
    code: z.string(),
    /**
     * The name of the language that will be shown on the Website.
     *
     * Can either be a fixed string or a translation key.
     */
    label: z.string(),
    /**
     * Should this language be used as a site language?
     *
     * Make sure to provide translations inside the `src/translations/` folder.
     *
     * Default is `false`
     */
    isSiteLanguage: z.boolean().default(false),
    /**
     * Should this language be used as the default site language?
     *
     * The default language will be used as a fallback when translations are missing
     * also this will be the language selected when a user visits the site on the `/` path.
     *
     * Setting this to `true` will also set `isSiteLanguage` to `true`.
     *
     * Default is `false`
     */
    isDefaultSiteLanguage: z.boolean().default(false),
    /**
     * An array of fallback language codes.
     *
     * This is used when no translation key is defined for this language.
     * The system will iterate over this array in order and use the first language for which a
     * matching translation key is found.
     *
     * If no match is found from the fallback languages, the system will
     * attempt the translation using the default site language.
     *
     * If the translation still cannot be resolved, it will then fall back to the English
     * translation as a final resort.
     *
     * @example ["fr", "it"]
     */
    fallbackLanguages: z.string().array().default([]),
  })
  .transform((language) => ({
    ...language,
    // if language is default site language also set is site language to true.
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
  title: z.string(),
  /**
   * All languages: content languages and site languages.
   */
  languages: languageSchema.array(),
  /**
   * Favicons for your site.
   */
  favicon: faviconSchema.array().optional(),
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
       * This can be a fixed string or a translation key.
       */
      alt: z.string().default(""),
      /**
       * Size in px to use for the logo on the header bar.
       * The size will be applied to the shorter side of your logo image.
       *
       * Default is 28 px.
       */
      size: z.number().default(28),
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
   * Configure search page behavior
   */
  searchPage: z
    .object({
      /**
       * When this is set to true, search results will be initially
       * filtered by site language. The filter will only be set when there
       * is any media item in the site language.
       */
      filterByLocale: z.boolean().default(false),
    })
    .optional(),
})

export type Language = z.input<typeof languageSchema>
export type Link = z.input<typeof linkSchema>

export type LightnetConfig = z.input<typeof configSchema>
export type PreparedLightnetConfig = z.output<typeof configSchema>
