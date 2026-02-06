// @ts-check
import { defineConfig } from "astro/config"
import lightnet from "lightnet"
import { fixedLabel, translatedLabel } from "lightnet/utils"

// https://astro.build/config
export default defineConfig({
  site: "https://test.com",
  integrations: [
    lightnet({
      title: fixedLabel("Basic Test"),
      logo: { src: "./src/assets/logo.png" },
      credits: true,
      languages: [
        {
          code: "en",
          label: fixedLabel("English"),
          isDefaultSiteLanguage: true,
        },
        {
          code: "de",
          label: fixedLabel("Deutsch"),
          isSiteLanguage: true,
        },
      ],
      favicon: [{ href: "favicon.svg" }],
      mainMenu: [
        {
          href: "/",
          label: translatedLabel("ln_homeTitle"),
        },
        {
          href: "/media",
          label: translatedLabel("ln_searchTitle"),
        },
      ],
    }),
  ],
})
