// @ts-check
import { defineConfig } from "astro/config"
import lightnet, { loadConfig } from "lightnet"

// https://astro.build/config
export default defineConfig({
  site: "https://test.com",
  integrations: [
    lightnet({
      ...(await loadConfig()),
      logo: { src: "./src/assets/logo.png" },
      credits: true,
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
    }),
  ],
})
