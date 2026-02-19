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
   * Name of the images folder next to the content files.
   */
  imagesFolder: z.string().default("images"),
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
   * todo
   */
  baseFolder: z.string().default(""),
})

export type SveltiaAdminConfig = z.input<typeof adminConfigSchema>

export type ExtendedSveltiaAdminConfig = z.output<typeof adminConfigSchema>
