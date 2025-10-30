import { useContext } from "react"

import { I18nContext } from "./i18n-context"

/**
 * Retrieves the current i18n helpers from context.
 * Must be called inside a React tree wrapped with `I18nContext.Provider`, otherwise throws.
 */
export const useI18n = () => {
  const i18n = useContext(I18nContext)
  if (!i18n) {
    throw new Error("No i18n context has been provided")
  }
  return i18n
}
