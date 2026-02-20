// @ts-check
import { defineConfig } from "astro/config"
import lightnet, { loadConfig } from "lightnet"

// https://astro.build/config
export default defineConfig({
  integrations: [
    lightnet({
      ...(await loadConfig()),
      logo: { src: "./src/assets/logo.png" },
      site: "https://lightnet.community",
      title: { en: "Basic Test", de: "Basic Test" },
      languages: {
        en: {
          label: { en: "English", de: "English" },
          isDefaultSiteLanguage: true,
        },
        de: {
          label: { en: "Deutsch", de: "Deutsch" },
          isSiteLanguage: true,
        },
      },
      favicon: [{ href: "favicon.svg" }],
      mainMenu: [
        {
          href: "/",
          label: { en: "Home", de: "Startseite" },
        },
        { href: "/media", label: { en: "Search", de: "Suche" } },
      ],
      translations: {
        en: {
          "home.all-items": "All items",
        },
        de: {
          "home.all-items": "Alle Artikel",
        },
      },
    }),
  ],
})
