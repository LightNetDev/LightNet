/**
 * Prepares the configuration object passed from an Astro page to the react i18n context.
 * Resolves every requested translation key (supporting wildcard suffixes like `ln.dashboard.*`)
 * so the React island receives only the strings it needs.
 *
 * @param i18n i18n helpers sourced from `Astro.locals`.
 * @param translationKeys Specific keys (or wildcard groups) required by the React component.
 * @returns A configuration object containing the resolved config.
 */
export const prepareI18nConfig = (
  { t, translationKeys: allKeys, currentLocale, direction }: I18n,
  translationKeys: string[],
) => {
  const resolveTranslations = (key: string) => {
    if (key.endsWith("*")) {
      const keyPrefix = key.slice(0, -1)
      return allKeys
        .filter((k) => k.startsWith(keyPrefix))
        .map((k) => [k, t(k)])
    }
    return [[key, t(key)]]
  }

  return {
    translations: Object.fromEntries(
      translationKeys.flatMap(resolveTranslations),
    ) as Record<string, string>,
    currentLocale,
    direction,
  }
}
