import type { AstroIntegration } from "astro"
import { AstroError } from "astro/errors"
import { z } from "astro/zod"

const configSchema = z
  .object({
    /**
     * Whether to track file downloads.
     *
     * Default: true
     */
    fileDownloads: z.boolean().default(true),
    /**
     * Whether to track outbound link clicks.
     *
     * Default: true
     */
    outboundLinks: z.boolean().default(true),
    /**
     * Whether to track form submissions.
     *
     * Default: false
     */
    formSubmissions: z.boolean().default(false),
  })
  .strict()

type Config = z.input<typeof configSchema>

export default function lightnetPlausibleAnalytics(
  config: Config = {},
): AstroIntegration {
  return {
    name: "@lightnet/plausible-analytics",
    hooks: {
      "astro:config:setup": ({ injectScript, config: { site } }) => {
        if (!site) {
          throw new AstroError(
            "Undefined site",
            "Set site config property inside astro.config",
          )
        }

        const verifiedConfig = verifySchema(
          configSchema,
          config,
          "Invalid plausible analytics config",
          "Fix lightnet plausible analytics config inside ",
        )

        const { hostname: domain } = new URL(site)
        const plausibleConfig = { domain, ...verifiedConfig }

        injectScript(
          "page",
          `import { init } from '@lightnet/plausible-analytics/tracker';
           if (document.documentElement.hasAttribute('data-ln-should-track')) { init(${JSON.stringify(plausibleConfig)}); }`,
        )
      },
    },
  }
}

function verifySchema<T extends z.Schema>(
  schema: T,
  toVerify: unknown,
  errorMessage: string,
  hint: string,
): z.output<T> {
  const parsed = schema.safeParse(toVerify, {})
  if (parsed.success) {
    return parsed.data
  }
  const issues = parsed.error.issues
    .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
    .join("\n")
  throw new AstroError(errorMessage, `${hint}\n\n${issues}`)
}
