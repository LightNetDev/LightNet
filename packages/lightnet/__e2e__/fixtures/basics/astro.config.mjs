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
      credits: true,
      languages: [
        {
          code: "en",
          label: { type: "fixed", value: "English" },
          isDefaultSiteLanguage: true,
        },
        {
          code: "de",
          label: { type: "fixed", value: "Deutsch" },
          isSiteLanguage: true,
        },
      ],
      favicon: [{ href: "favicon.svg" }],
      mainMenu: [
        {
          href: "/",
          label: { type: "translated", value: "ln.home.title" },
        },
        {
          href: "/media",
          label: { type: "translated", value: "ln.search.title" },
        },
      ],
    }),
  ],
})
