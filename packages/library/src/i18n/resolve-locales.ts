import type { Language } from "../astro-integration/config"

export const resolveLocales = ({ languages }: { languages: Language[] }) => {
  return languages.filter((l) => !!l.translations).map((l) => l.code)
}
