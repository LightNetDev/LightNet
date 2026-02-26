// @ts-check
import lightnetSveltiaAdmin from "@lightnet/sveltia-admin"
import { defineConfig } from "astro/config"
import lightnet, { loadConfig } from "lightnet"

export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  integrations: [
    lightnet(await loadConfig()),
    lightnetSveltiaAdmin({
      siteRootInRepo: "/playground/sk8-ministries",
      logo: { src: "./src//assets/logo.svg" },
    }),
  ],
})
