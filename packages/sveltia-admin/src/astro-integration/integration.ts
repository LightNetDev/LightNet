import type { AstroIntegration, ViteUserConfig } from "astro"
import { z } from "astro/zod"
import { verifySchema } from "lightnet/utils"

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

const userConfigSchema = z.object({
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

export type SveltiaAdminConfig = z.input<typeof userConfigSchema>

export type SveltiaAdminUserConfig = z.output<typeof userConfigSchema> & {
  site?: string
}

export default function lightnetSveltiaAdmin(
  config: SveltiaAdminConfig,
): AstroIntegration {
  return {
    name: "@lightnet/sveltia-admin",
    hooks: {
      "astro:config:setup": ({
        injectRoute,
        updateConfig,
        config: astroConfig,
      }) => {
        const preparedConfig = {
          ...verifySchema(
            userConfigSchema,
            config,
            "Invalid LightNet Administration UI configuration",
            "Fix these errors on the sveltiaAdmin configuration inside astro.config.mjs:",
          ),
          site: astroConfig.site ?? "localhost:4321",
        }

        injectRoute({
          pattern: preparedConfig.path,
          entrypoint: "@lightnet/sveltia-admin/Admin.astro",
          prerender: true,
        })
        injectRoute({
          pattern: `${preparedConfig.path}/config.json`,
          entrypoint: "@lightnet/sveltia-admin/config.json.ts",
          prerender: true,
        })

        updateConfig({
          vite: {
            plugins: [vitePluginSveltiaAdminConfig(preparedConfig)],
          },
        })
      },
    },
  }
}

const CONFIG = "virtual:lightnet/sveltiaAdminConfig"
const VIRTUAL_MODULES = [CONFIG] as const

function vitePluginSveltiaAdminConfig(
  userConfig: SveltiaAdminUserConfig,
): NonNullable<ViteUserConfig["plugins"]>[number] {
  return {
    name: "vite-plugin-lightnet-sveltia-admin-config",
    resolveId(id): string | undefined {
      const module = VIRTUAL_MODULES.find((m) => m === id)
      if (module) return `\0${module}`
    },
    load(id): string | undefined {
      const module = VIRTUAL_MODULES.find((m) => id === `\0${m}`)
      switch (module) {
        case CONFIG:
          return `export default ${JSON.stringify(userConfig)};`
      }
    },
  }
}
