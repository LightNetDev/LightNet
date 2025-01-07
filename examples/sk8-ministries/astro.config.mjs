// @ts-check
import lightnetDecapAdmin from "@lightnet/decap-admin"
import lightnetLibrary from "@lightnet/library"
import { defineConfig } from "astro/config"

import deTranslations from "./src/translations/de.json"
import enTranslations from "./src/translations/en.json"

/**
 * Defines the available languages for the site, covering both
 * user interface and content languages.
 *
 * @type {import('@lightnet/library').Language[]}
 */
const languages = [
  {
    code: "en", // ISO language code for English
    name: "English", // Name displayed in the language selector
    translations: enTranslations, // UI translations for English
    isDefaultLocale: true, // Sets English as the default language
  },
  {
    code: "de", // ISO language code for German
    name: "Deutsch", // Display name for German
    translations: deTranslations, // UI translations for German
  },
]

export default defineConfig({
  /**
   * Base URL of your website. This is used for tasks like identifying
   * external links and generating absolute URLs.
   */
  site: "https://sk8-ministries.pages.dev",

  integrations: [
    /**
     * Configuration for the LightNet Library integration.
     * This defines core settings such as title, logo, languages, and menu.
     */
    lightnetLibrary({
      /**
       * Title of the website. It appears in the browser tab and the header bar.
       */
      title: "Sk8 Ministries",

      /**
       * Path to the logo displayed in the header, located in ./src/assets.
       * Supported formats: svg, png, jpg, webp. Your logo will be optimized for size.
       */
      logo: { src: "./src/assets/logo.png" },

      /**
       * Language settings for UI and content.
       */
      languages: languages,

      /**
       * Favicon settings for browser tabs and bookmarks.
       * Specify multiple formats for optimal compatibility across devices.
       */
      favicon: [
        { href: "favicon.ico", sizes: "32x32" }, // Default icon for browsers
        { href: "favicon.svg" }, // Scalable vector icon
      ],

      /**
       * Main menu configuration. This defines the links displayed in the header
       * menu (accessible via the hamburger icon).
       */
      mainMenu: [
        {
          /**
           * Link to the home page.
           * The current locale is automatically prefixed for relative paths.
           */
          href: "/",
          label: "ln.home.title", // LightNet internal translation key
        },
        {
          /**
           * Link to the search page.
           */
          href: "/media",
          label: "ln.search.title", // LightNet internal translation key
        },
        {
          /**
           * Link to a custom About page.
           */
          href: "/about",
          label: "navigation.about", // Custom translation key defined in translations
        },
        {
          /**
           * Link to an external website.
           */
          href: "https://www.om.org/eng/mediaworks/lightnet",
          label: "LightNet", // Fixed string; not translatable
        },
      ],

      /**
       * Configuration for the search page.
       */
      searchPage: {
        /**
         * Filters search results by the current locale when navigating to the search page.
         */
        filterByLocale: true,
      },
    }),

    /**
     * Configuration for the LightNet Decap Admin integration.
     * This provides a UI for managing content.
     */
    lightnetDecapAdmin({
      /**
       * Content languages. This should match the languages array of the lightnetLibrary config.
       */
      languages: languages,
    }),
  ],
})
