// @ts-check
import lightnetSveltiaAdmin from "@lightnet/sveltia-admin"
import { defineConfig } from "astro/config"
import lightnet from "lightnet"

import languages from "./languages.json" assert { type: "json" }

// https://astro.build/config
export default defineConfig({
  site: "https://admin-local-repo.example",
  integrations: [
    lightnet({
      logo: { src: "./src/assets/logo.png" },
      title: { en: "Admin Local Repo", de: "Admin Local Repo" },
      languages,
      favicon: [{ href: "favicon.svg" }],
      credits: true,
      mainMenu: [
        {
          href: "/",
          label: { en: "Home", de: "Startseite" },
        },
        { href: "/media", label: { en: "Search", de: "Suche" } },
        {
          href: "/admin",
          label: { en: "Admin", de: "Admin" },
          requiresLocale: false,
        },
      ],
    }),
    lightnetSveltiaAdmin({
      siteRootInRepo:
        "/packages/sveltia-admin/__e2e__/fixtures/admin-local-repo",
      experimental: {
        useLanguagesCollection: true,
      },
    }),
  ],
})
