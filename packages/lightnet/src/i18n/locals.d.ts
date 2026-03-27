declare namespace App {
  interface Locals {
    /**
     * Provides internationalization helpers.
     */
    i18n: I18n
  }
}

type I18n = {
  /**
   * Translate a key to the language of the current locale.
   *
   * @param TranslationKey to be translated.
   */
  t: import("./translate").TranslateFn

  /**
   * Resolve an inline translation map to the language of the current locale.
   */
  tInline: import("./inline-translation").InlineTranslateFn

  /**
   *  The current locale resolved by LightNet from the URL pathname.
   *
   *  If no supported locale is present in the pathname,
   *  this falls back to the configured default locale.
   */
  currentLocale: string

  /**
   * The current text direction. Left-to-right or right-to-left.
   */
  direction: "ltr" | "rtl"

  /**
   * The default locale as defined in the project configuration.
   */
  defaultLocale: string

  /**
   * The available locales as defined in the project configuration.
   */
  locales: string[]

  /**
   * All available translation keys.
   */
  translationKeys: string[]
}
