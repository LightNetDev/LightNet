import type { Language } from "./config"

export const resolveLocales = ({
  languages,
}: {
  languages: Record<string, Language>
}) => {
  return Object.entries(languages)
    .filter(([_, l]) => l.isSiteLanguage)
    .map(([bcp47]) => bcp47)
}
