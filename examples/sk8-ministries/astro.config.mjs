// @ts-check
import lightnetDecapAdmin from "@lightnet/decap-admin"
import { defineConfig } from "astro/config"
import lightnet from "lightnet"

/**
 * @type {import('lightnet').Language[]}
 */
const languages = [
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
  {
    code: "ar",
    label: "Arabic",
    isSiteLanguage: true,
  },
]

export default defineConfig({
  site: "https://sk8-ministries.pages.dev",

  integrations: [
    lightnet({
      title: "x.site.title",
      logo: { src: "./src/assets/logo.png" },
      languages,
      favicon: [
        { href: "favicon.ico", sizes: "32x32" },
        { href: "favicon.svg" },
      ],
      mainMenu: [
        {
          href: "/",
          label: "ln.home.title",
        },
        {
          href: "/media",
          label: "ln.search.title",
        },
        {
          href: "/about",
          label: "x.navigation.about",
        },
        {
          href: "https://www.om.org/eng/mediaworks/lightnet",
          label: "LightNet",
        },
      ],
      searchPage: {
        filterByLocale: true,
      },
    }),
    lightnetDecapAdmin({ languages }),
  ],
})
