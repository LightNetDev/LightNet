import { fileURLToPath } from "node:url"

import type { AstroIntegration, ViteUserConfig } from "astro"
import { AstroError } from "astro/errors"
import { verifySchema } from "lightnet/utils"

import {
  adminConfigSchema,
  type ExtendedSveltiaAdminConfig,
  type SveltiaAdminConfig,
} from "./config"

export default function lightnetSveltiaAdmin(
  config: SveltiaAdminConfig,
): AstroIntegration {
  return {
    name: "@lightnet/sveltia-admin",
    hooks: {
      "astro:config:setup": ({ injectRoute, updateConfig }) => {
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
      "astro:server:start": ({ address }) => {
        process.env.LIGHTNET_DEV_SITE_URL = `http://localhost:${address.port}`
      },
    },
  }
}

const CONFIG = "virtual:lightnet/sveltiaAdminConfig"
const MEDIA_ITEM_EDIT_BUTTON_CONTROLLER =
  "virtual:lightnet/components/media-item-edit-button-controller"
const MEDIA_ITEM_EDIT_BUTTON_CONTROLLER_PATH = JSON.stringify(
  fileURLToPath(
    new URL("./media-item-edit-button-controller.ts", import.meta.url),
  ),
)
const VIRTUAL_MODULES = [CONFIG, MEDIA_ITEM_EDIT_BUTTON_CONTROLLER] as const

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
        case MEDIA_ITEM_EDIT_BUTTON_CONTROLLER:
          return userConfig.path === "admin"
            ? `export { default } from ${MEDIA_ITEM_EDIT_BUTTON_CONTROLLER_PATH};`
            : "export default undefined;"
      }
    },
  }
}
