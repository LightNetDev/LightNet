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
     * BCP-47 language tag for this language.
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
     * The text direction of this language.
     *
     * Either right-to-left = rtl, or left-to-right = ltr.
     *
     * Default is "ltr".
     */
    direction: z.enum(["rtl", "ltr"]).default("ltr"),
    /**
     * Should this language be used as an user interface language?
     *
     * Make sure to provide translations inside the `src/translations/` folder.
     *
     * Default is `false`
     */
    isUILanguage: z.boolean().default(false),
    /**
     * Should this language be used as the default user interface language?
     *
     * The default language will be used as a fallback when translations are missing
     * also this will be the language selected when a user visits the site on the `/` path.
     *
     * Setting this to `true` will also set `isUILanguage` to `true`.
     *
     * Default is `false`
     */
    isDefaultUILanguage: z.boolean().default(false),
  })
  .transform((language) => ({
    ...language,
    // if language is default ui language also set is ui language to true.
    isUILanguage: language.isDefaultUILanguage || language.isUILanguage,
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
   * All languages: content languages and ui languages.
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
       * filtered by UI language. The filter will only be set when there
       * is any media item in the UI language.
       */
      filterByLocale: z.boolean().default(false),
    })
    .optional(),
})

export type Language = z.input<typeof languageSchema>
export type Link = z.input<typeof linkSchema>

export type LightnetConfig = z.input<typeof configSchema>
export type PreparedLightnetConfig = z.output<typeof configSchema>
