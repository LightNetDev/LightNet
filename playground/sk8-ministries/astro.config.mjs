// @ts-check
import { defineConfig } from "astro/config"
import lightnet from "lightnet"
import { fixedLabel, translatedLabel } from "lightnet/utils"

/**
 * @type {import('lightnet').Language[]}
 */
const languages = [
  {
    code: "en",
    label: fixedLabel("English"),
    isDefaultSiteLanguage: true,
  },
  {
    code: "de",
    label: fixedLabel("Deutsch"),
    isSiteLanguage: true,
  },
  {
    code: "ar",
    label: fixedLabel("العربية"),
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
      title: translatedLabel("site.title"),
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
          label: translatedLabel("ln.home.title"),
        },
        {
          href: "/media",
          label: translatedLabel("ln.search.title"),
        },
        {
          href: "/about",
          label: translatedLabel("navigation.about"),
        },
        {
          href: "https://www.om.org/eng/mediaworks/lightnet",
          label: fixedLabel("LightNet"),
        },
      ],
      searchPage: {
        filterByLocale: true,
      },
    }),
  ],
})
