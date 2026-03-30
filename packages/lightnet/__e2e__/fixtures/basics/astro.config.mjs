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
      languages: [
        {
          code: "en",
          label: { en: "English", de: "English" },
          isDefaultSiteLanguage: true,
        },
        {
          code: "de",
          label: { en: "Deutsch", de: "Deutsch" },
          isSiteLanguage: true,
        },
      ],
      favicon: [{ href: "favicon.svg" }],
      credits: true,
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
