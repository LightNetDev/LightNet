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
})

export type SveltiaAdminConfig = z.input<typeof adminConfigSchema>

export type ExtendedSveltiaAdminConfig = z.output<typeof adminConfigSchema>
