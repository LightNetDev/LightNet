import type { AstroIntegration, ViteUserConfig } from "astro"
import { z } from "astro/zod"
import { verifySchema } from "lightnet/utils"

import { vitePluginExportAdminImages } from "./export-admin-images"

/**
 * @see https://decapcms.org/docs/gitlab-backend/
 */
const gitlabSchema = z.object({
  name: z.literal("gitlab"),
  repo: z.string(),
  appId: z.string(),
  branch: z.string().default("main"),
  authType: z.literal("pkce").default("pkce"),
})

/**
 * @see https://decapcms.org/docs/github-backend/
 */
const githubSchema = z.object({
  name: z.literal("github"),
  repo: z.string(),
  baseUrl: z.string(),
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
   * Content languages and site languages.
   */
  languages: z
    .object({
      code: z.string(),
      isDefaultSiteLanguage: z.boolean().default(false),
    })
    .array(),
  /**
   * Connected Git Host.
   */
  backend: gitlabSchema.or(githubSchema).optional(),
})

export type DecapAdminConfig = z.input<typeof userConfigSchema>

export type DecapAdminUserConfig = z.output<typeof userConfigSchema> & {
  site?: string
}

export default function lightnetDecapAdmin(
  config: DecapAdminConfig,
): AstroIntegration {
  return {
    name: "@lightnet/decap-admin",
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
            "Invalid config passed to Decap Admin integration.",
          ),
          site: astroConfig.site ?? "localhost:4321",
        }

        injectRoute({
          pattern: preparedConfig.path,
          entrypoint: "@lightnet/decap-admin/Admin.astro",
          prerender: true,
        })
        injectRoute({
          pattern: `${preparedConfig.path}/config.yml`,
          entrypoint: "@lightnet/decap-admin/decap-config.ts",
          prerender: true,
        })

        updateConfig({
          vite: {
            plugins: [
              vitePluginDecapAdminConfig(preparedConfig),
              vitePluginExportAdminImages(astroConfig, preparedConfig),
            ],
          },
        })
      },
    },
  }
}

const CONFIG = "virtual:lightnet/decapAdminUserConfig"
const VIRTUAL_MODULES = [CONFIG] as const

function vitePluginDecapAdminConfig(
  userConfig: DecapAdminUserConfig,
): NonNullable<ViteUserConfig["plugins"]>[number] {
  return {
    name: "vite-plugin-lightnet-decap-admin-config",
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
