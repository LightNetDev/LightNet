import type { GetStaticPaths } from "astro"
import config from "virtual:lightnet/config"

export const getLocalePaths = (() => {
  return config.locales.map((locale) => ({ params: { locale } }))
}) satisfies GetStaticPaths
