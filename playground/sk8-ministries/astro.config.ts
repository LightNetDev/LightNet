import lightnetSveltiaAdmin from "@lightnet/sveltia-admin"
import { defineConfig } from "astro/config"
import lightnet from "lightnet"

import lightnetConfig from "./lightnet.config.json"

export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  integrations: [
    lightnet(lightnetConfig),
    lightnetSveltiaAdmin({
      siteRootInRepo: "/playground/sk8-ministries",
    }),
  ],
})
