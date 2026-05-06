import { defineConfig } from "vitest/config"

import { vitePluginLightnetConfig } from "./src/astro-integration/vite-plugin-lightnet-config"

export default defineConfig({
  resolve: {
    alias: {
      "astro:config/server": new URL(
        "./__tests__/mocks/astro-config-server.ts",
        import.meta.url,
      ).pathname,
    },
  },
  test: {
    include: ["__tests__/**/*.spec.ts"],
  },
  plugins: [
    vitePluginLightnetConfig(
      {
        title: { en: "Sk8 Ministries" },
        logo: { src: "./logo.svg" },
        languages: [
          {
            code: "en",
            label: { en: "English" },
            isDefaultSiteLanguage: true,
            isSiteLanguage: true,
            fallbackLanguages: [],
          },
          {
            code: "de",
            label: { en: "German" },
            isSiteLanguage: true,
            fallbackLanguages: ["en"],
          },
        ],
        locales: ["en", "de"],
        defaultLocale: "en",
        internalDomains: [],
      },
      { site: "https://sk8-ministries.dev" },
    ),
  ],
})
