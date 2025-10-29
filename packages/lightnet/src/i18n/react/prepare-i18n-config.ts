/**
 * this is called inside astro component to create a data object holding all data
 * to initialize i18n inside the react component.
 * @param translationKeys to be translated. Can also use wildcards with "*"
 * @param i18n Astro.locals.i18n object
 * @returns 
 */
export const prepareI18nConfig = ({ t, translationKeys: allKeys }: I18n, translationKeys: string[],) => {
  const resolveTranslations = (key: string) => {
    if (key.endsWith("*")) {
      const keyPrefix = key.slice(0, -1)
      return allKeys.filter(k => k.startsWith(keyPrefix)).map(k => ([k, t(k)]))
    }
    return [[key, t(key)]]
  }

  return {
    translations: Object.fromEntries(
      translationKeys.flatMap(resolveTranslations),
    ) as Record<string, string>
  }
}



