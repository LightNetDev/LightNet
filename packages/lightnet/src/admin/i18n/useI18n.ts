import { useContext } from "react"
import { I18nContext } from "./i18n-context"

export const useI18n = () => {
  return useContext(I18nContext)
}