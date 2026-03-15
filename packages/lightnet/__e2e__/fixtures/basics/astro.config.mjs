// @ts-check
import { defineConfig } from "astro/config"
import lightnet from "lightnet"

// https://astro.build/config
export default defineConfig({
  site: "https://lightnet.community",
  integrations: [
    lightnet({
      logo: { src: "./src/assets/logo.png" },
      title: { en: "Basic Test", de: "Basic Test" },
      siteLanguages: [{ code: "en", isDefault: true }, { code: "de" }],
      favicon: [{ href: "favicon.svg" }],
      mainMenu: [
        {
          href: "/",
          label: { en: "Home", de: "Startseite" },
        },
        { href: "/media", label: { en: "Search", de: "Suche" } },
      ],
    }),
  ],
})
