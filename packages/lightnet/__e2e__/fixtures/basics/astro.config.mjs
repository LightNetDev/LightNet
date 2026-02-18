// @ts-check
import { defineConfig } from "astro/config"
import lightnet from "lightnet"

// https://astro.build/config
export default defineConfig({
  site: "https://test.com",
  integrations: [
    lightnet({
      title: { en: "Basic Test", de: "Basic Test" },
      logo: { src: "./src/assets/logo.png" },
      credits: true,
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
