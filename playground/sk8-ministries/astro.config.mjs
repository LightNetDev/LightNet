// @ts-check
import { defineConfig } from "astro/config"
import lightnet from "lightnet"

/**
 * @type {import('lightnet').Language[]}
 */
const languages = [
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
  {
    code: "ar",
    label: { type: "fixed", value: "العربية" },
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
      title: "site.title",
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
          label: { type: "translated", value: "ln.home.title" },
        },
        {
          href: "/media",
          label: { type: "translated", value: "ln.search.title" },
        },
        {
          href: "/about",
          label: { type: "translated", value: "navigation.about" },
        },
        {
          href: "https://www.om.org/eng/mediaworks/lightnet",
          label: { type: "fixed", value: "LightNet" },
        },
      ],
      searchPage: {
        filterByLocale: true,
      },
    }),
  ],
})
