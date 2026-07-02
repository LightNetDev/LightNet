import type { APIRoute } from "astro"
import { AstroError } from "astro/errors"
import config from "virtual:lightnet/config"
import adminConfig from "virtual:lightnet/sveltiaAdminConfig"

import { createConfig } from "./sveltia.config"

export const GET: APIRoute = () => {
  validateAdminConfig()
  return new Response(JSON.stringify(createConfig()))
}

/**
 * When validating the admin config structure in integration.ts, we do not
 * have access to the resolved LightNet config. This function acts as a hook
 * for more detailed validation that depends on the resolved LightNet config.
 */
const validateAdminConfig = () => {
  const { summaryLocale } = adminConfig.experimental
  if (summaryLocale && !config.locales.includes(summaryLocale)) {
    throw new AstroError(
      "Invalid summaryLocale",
      `summaryLocale must match one of your site languages: ${JSON.stringify(config.locales)}.`,
    )
  }
}
