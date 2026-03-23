import { z } from "astro/zod"

/**
 * @see https://sveltiacms.app/en/docs/backends/gitlab
 */
const gitlabSchema = z
  .object({
    name: z.literal("gitlab"),
    repo: z.string(),
    appId: z.string().optional(),
    branch: z.string().default("main"),
    authType: z.literal("pkce").default("pkce"),
  })
  .transform((gitlabConfig) => ({
    ...gitlabConfig,
    app_id: gitlabConfig.appId,
    auth_type: gitlabConfig.authType,
  }))

/**
 * @see https://sveltiacms.app/en/docs/backends/github
 */
const githubSchema = z
  .object({
    name: z.literal("github"),
    repo: z.string(),
    baseUrl: z.string().optional(),
    branch: z.string().default("main"),
  })
  .transform((githubConfig) => ({
    ...githubConfig,
    base_url: githubConfig.baseUrl,
  }))

export const adminConfigSchema = z.object({
  /**
   * Path for the admin page.
   *
   * Default is /admin
   */
  path: z.string().default("admin"),
  /**
   * Maximum upload file size in megabytes.
   *
   * Default is 25 (this aligns with Cloudflare's max file size).
   */
  maxFileSize: z.number().default(25),
  /**
   * Connected Git Host.
   */
  backend: gitlabSchema.or(githubSchema).optional(),

  /**
   * Path from the repository root to the LightNet site root.
   * Set this when the site lives in a subdirectory (for example, in a monorepo).
   * Leave empty when the site is at the repository root.
   */
  siteRootInRepo: z.string().default(""),

  /**
   * Experimental config options are opt-in and might change with any release.
   */
  experimental: z
    .object({
      /**
       * Enable editing LightNet languages through the admin UI.
       *
       * This expects a `languages.json` file at the LightNet site root
       * (for example `/languages.json` inside your Astro site directory,
       * not inside this package). That file should contain the full
       * LightNet `languages` array, including each language's `code`,
       * translated `label`, and any site-language flags like
       * `isDefaultSiteLanguage` or `isSiteLanguage`.
       *
       * Your site's `astro.config.*` should import that file and pass it to
       * `lightnet({ languages })`.
       *
       * @example
       * import languages from "./languages.json" assert { type: "json" }
       *
       * export default defineConfig({
       *   integrations: [
       *     lightnet({ languages }),
       *     lightnetSveltiaAdmin({
       *       experimental: {
       *         useLanguagesCollection: true,
       *       },
       *     }),
       *   ],
       * })
       *
       * This option is experimental and may change without a stable
       * migration path.
       */
      useLanguagesCollection: z.boolean().default(false),
    })
    .optional(),
})

export type SveltiaAdminConfig = z.input<typeof adminConfigSchema>

export type ExtendedSveltiaAdminConfig = z.output<typeof adminConfigSchema>
