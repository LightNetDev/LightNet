// @ts-check
import { defineConfig } from "astro/config"
import lightnet from "lightnet"

// https://astro.build/config
export default defineConfig({
  site: "https://test.com",
  integrations: [
    lightnet({
      title: "Basic Test",
      logo: { src: "./src/assets/logo.png" },
      languages: [
        {
          code: "en",
          label: "English",
          isDefaultSiteLanguage: true,
        },
        {
          code: "de",
          label: "Deutsch",
          isSiteLanguage: true,
        },
      ],
      favicon: [{ href: "favicon.svg" }],
      mainMenu: [
        {
          href: "/",
          label: "ln.home.title",
        },
        { href: "/media", label: "ln.search.title" },
      ],
    }),
  ],
})
