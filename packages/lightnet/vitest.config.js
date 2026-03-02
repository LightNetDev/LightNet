import { defineConfig } from "vitest/config"

import { vitePluginLightnetConfig } from "./src/astro-integration/vite-plugin-lightnet-config"

export default defineConfig({
  test: {
    include: ["__tests__/**/*.spec.ts"],
  },
  plugins: [
    vitePluginLightnetConfig(
      {
        title: { en: "Sk8 Ministries" },
        logo: { src: "./logo.svg" },
        siteLanguages: ["en", "de"],
        defaultSiteLanguage: "en",
        fallbackLanguages: { de: ["en"] },
        locales: ["en", "de"],
        defaultLocale: "en",
        translations: {},
        internalDomains: [],
      },
      { site: "https://sk8-ministries.dev" },
    ),
  ],
})
