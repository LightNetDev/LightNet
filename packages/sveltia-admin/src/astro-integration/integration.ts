import type { AstroIntegration, ViteUserConfig } from "astro"
import { AstroError } from "astro/errors"

import {
  adminConfigSchema,
  type ExtendedSveltiaAdminConfig,
  type SveltiaAdminConfig,
} from "./config"
import { verifySchema } from "./verify-schema"

export default function lightnetSveltiaAdmin(
  config: SveltiaAdminConfig = {},
): AstroIntegration {
  return {
    name: "@lightnet/sveltia-admin",
    hooks: {
      "astro:config:setup": ({ command, injectRoute, updateConfig }) => {
        if (Object.hasOwn(config, "imagesFolder")) {
          throw new AstroError(
            "Invalid LightNet Administration UI configuration",
            "Fix these errors on the sveltiaAdmin configuration inside astro.config.mjs:\n\n- imagesFolder: `imagesFolder` was removed. Remove this option from `sveltiaAdmin(...)`. Image paths now always resolve from the content-adjacent `images` folder.",
          )
        }

        const preparedConfig = verifySchema(
          adminConfigSchema,
          config,
          "Invalid LightNet Administration UI configuration",
          "Fix these errors on the sveltiaAdmin configuration inside astro.config.mjs:",
        )

        // During development, serve plain HTML to prevent Vite reloads from
        // interrupting CMS saves. In production, use the Astro page to bundle assets.
        // See: https://sveltiacms.app/en/docs/workflows/local#troubleshooting
        if (command === "dev") {
          injectRoute({
            pattern: preparedConfig.path,
            entrypoint: "@lightnet/sveltia-admin/admin.html.ts",
            prerender: true,
          })
        } else {
          injectRoute({
            pattern: preparedConfig.path,
            entrypoint: "@lightnet/sveltia-admin/Admin.astro",
            prerender: true,
          })
        }

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
      "astro:server:start": ({ address }) => {
        process.env.LIGHTNET_DEV_SITE_URL = `http://localhost:${address.port}`
      },
    },
  }
}

const CONFIG = "virtual:lightnet/sveltiaAdminConfig"
const VIRTUAL_MODULES = [CONFIG] as const

function vitePluginSveltiaAdminConfig(
  userConfig: ExtendedSveltiaAdminConfig,
): NonNullable<ViteUserConfig["plugins"]>[number] {
  return {
    name: "vite-plugin-lightnet-sveltia-admin-config",
    enforce: "pre",
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
