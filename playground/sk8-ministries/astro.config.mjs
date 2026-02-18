// @ts-check
import { defineConfig } from "astro/config"
import lightnet, { loadConfig } from "lightnet"

export default defineConfig({
  site: "https://sk8-ministries.pages.dev",
  devToolbar: {
    enabled: false,
  },
  integrations: [lightnet(await loadConfig())],
})
