import { z } from "astro/zod"

const normalizeAdminPath = (path: string) => path.replace(/^\/+|\/+$/g, "")

/**
 * @see https://sveltiacms.app/en/docs/backends/gitlab
 */
const gitlabSchema = z.object({
  name: z.literal("gitlab"),
  repo: z.string(),
  appId: z.string().optional(),
  branch: z.string().default("main"),
  authType: z.literal("pkce").default("pkce"),
})

/**
 * @see https://sveltiacms.app/en/docs/backends/github
 */
const githubSchema = z.object({
  name: z.literal("github"),
  repo: z.string(),
  baseUrl: z.string().optional(),
  branch: z.string().default("main"),
})

// Internal testing backend used by the Playwright harness.
const testRepoSchema = z.object({
  name: z.literal("test-repo"),
})

const r2Storage = z.object({
  name: z.literal("cloudflare-r2"),
  /**
   * R2 Access Key ID (64 hex characters). Safe to store in config.
   */
  accessKeyId: z.string(),
  /**
   * The R2 bucket name.
   */
  bucket: z.string(),
  /**
   * Your Cloudflare account ID. Used to construct the S3 API endpoint.
   */
  accountId: z.string(),
  /**
   * Public URL for asset previews and downloads. Required because the R2 S3 API always requires authentication.
   */
  publicUrl: z.string(),
  /**
   * Path prefix within the bucket, e.g. uploads/.
   */
  prefix: z.string().optional(),
})

export const adminConfigSchema = z.object({
  /**
   * Path for the admin page.
   *
   * Default is /admin
   */
  path: z.string().default("admin").transform(normalizeAdminPath),
  /**
   * Maximum upload file size in megabytes.
   *
   * Default is 25 (this aligns with Cloudflare's max file size).
   */
  maxFileSize: z.number().default(25),
  /**
   * Connected Git Host.
   */
  backend: gitlabSchema.or(githubSchema).or(testRepoSchema).optional(),

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
       * import languages from "./languages.json"
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
      /**
       * Use Cloudflare r2 for content uploads.
       */
      fileStorage: r2Storage.optional(),
    })
    .optional(),
})

export type SveltiaAdminConfig = z.input<typeof adminConfigSchema>

export type ExtendedSveltiaAdminConfig = z.output<typeof adminConfigSchema>
