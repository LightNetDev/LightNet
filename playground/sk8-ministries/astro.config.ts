import lightnetSveltiaAdmin from "@lightnet/sveltia-admin"
import { defineConfig } from "astro/config"
import lightnet from "lightnet"

import languages from "./languages.json" assert { type: "json" }

export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  site: "https://sk8-ministries.pages.dev",
  integrations: [
    lightnet({
      title: {
        en: "Sk8 Ministries",
        de: "Sk8 Ministries",
        ar: "خدمات التزلج على الألواح",
      },
      logo: { src: "./src/assets/logo.png" },
      favicon: [
        { href: "favicon.ico", sizes: "32x32" },
        { href: "favicon.svg" },
      ],
      credits: true,
      searchPage: {
        filterByLocale: true,
      },
      languages,
      mainMenu: [
        {
          href: "/",
          label: {
            en: "Home",
            ar: "الصفحة الرئيسية",
            de: "Startseite",
          },
        },
        {
          href: "/media",
          label: {
            en: "Search",
            ar: "بحث",
            de: "Suche",
          },
        },
        {
          href: "/about",
          label: {
            en: "About",
            ar: "من نحن",
            de: "Über uns",
          },
        },
        {
          href: "/admin",
          label: {
            en: "Admin",
            ar: "Admin",
            de: "Admin",
          },
          requiresLocale: false,
        },
        {
          href: "https://www.om.org/eng/mediaworks/lightnet",
          label: {
            en: "LightNet",
            ar: "LightNet",
            de: "LightNet",
          },
        },
      ],
    }),
    lightnetSveltiaAdmin({
      siteRootInRepo: "/playground/sk8-ministries",
      experimental: {
        useLanguagesCollection: true,
      },
    }),
  ],
})
