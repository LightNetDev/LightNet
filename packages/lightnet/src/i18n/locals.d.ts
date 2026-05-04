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
   * Resolve a translation map to the language of the current locale.
   *
   * Use this for inline translation maps, such as labels from config or content entries.
   *
   * @param translationMap Localized values keyed by locale code.
   * @param context Describes where the map came from. Pass the original
   * field path so missing-translation messages can point to the exact config
   * or content field that needs a value, for example `["config", "title"]`
   * or `["content", 0, "label"]`.
   *
   * @example
   * Astro.locals.i18n.tMap(config.title, {
   *   path: ["config", "title"],
   * })
   */
  tMap: import("./translate-map").TranslateMapFn

  /**
   * Resolve an inline translation map that belongs to LightNet config.
   *
   * Use this for translated values read from the resolved runtime config,
   * such as the site title or configured language labels.
   *
   * @param translationMap Localized values keyed by locale code.
   * @param config The resolved LightNet config object that owns the field.
   */
  tConfigField: import("./translate-map").TranslateConfigFieldFn

  /**
   * Resolve an inline translation map that belongs to a content entry.
   *
   * Use this for translated values stored inside content collections,
   * such as category labels, media type labels, or content item labels.
   *
   * @param translationMap Localized values keyed by locale code.
   * @param contentEntry The content entry that owns the translated field.
   */
  tContentField: import("./translate-map").TranslateContentFieldFn

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
