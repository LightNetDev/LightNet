// @ts-check
import { defineConfig } from "astro/config"
import lightnet from "lightnet"

/**
 * @type {import('lightnet').Language[]}
 */
const languages = [
  {
    code: "en",
    label: { en: "English", de: "English", ar: "English" },
    isDefaultSiteLanguage: true,
  },
  {
    code: "de",
    label: { en: "Deutsch", de: "Deutsch", ar: "Deutsch" },
    isSiteLanguage: true,
  },
  {
    code: "ar",
    label: { en: "العربية", de: "العربية", ar: "العربية" },
    isSiteLanguage: true,
  },
]

export default defineConfig({
  site: "https://sk8-ministries.pages.dev",
  devToolbar: {
    enabled: false,
  },
  integrations: [
    lightnet({
      title: {
        en: "Sk8 Ministries",
        de: "Sk8 Ministries",
        ar: "خدمات التزلج على الألواح",
      },
      credits: true,
      logo: { src: "./src/assets/logo.png" },
      languages,
      favicon: [
        { href: "favicon.ico", sizes: "32x32" },
        { href: "favicon.svg" },
      ],
      mainMenu: [
        {
          href: "/",
          label: { en: "Home", de: "Startseite", ar: "الصفحة الرئيسية" },
        },
        {
          href: "/media",
          label: { en: "Search", de: "Suche", ar: "بحث" },
        },
        {
          href: "/about",
          label: { en: "About", de: "Über uns", ar: "من نحن" },
        },
        {
          href: "/admin",
          label: { en: "Admin", de: "Admin", ar: "Admin" },
          requiresLocale: false,
        },
        {
          href: "https://www.om.org/eng/mediaworks/lightnet",
          label: { en: "LightNet", de: "LightNet", ar: "LightNet" },
        },
      ],
      searchPage: {
        filterByLocale: true,
      },
    }),
  ],
})
