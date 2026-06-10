// @ts-check
import { defineConfig } from "astro/config"
import lightnet from "lightnet"

// https://astro.build/config
export default defineConfig({
  site: "https://lightnet.community",
  integrations: [
    lightnet({
      title: { en: "Search Indexing Test" },
      languages: [
        {
          code: "en",
          label: { en: "English" },
          isDefaultSiteLanguage: true,
        },
      ],
      disallowSearchIndexing: true,
      mainMenu: [
        {
          href: "/",
          label: { en: "Home" },
        },
      ],
    }),
  ],
})
