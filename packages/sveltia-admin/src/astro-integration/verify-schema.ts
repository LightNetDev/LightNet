import { AstroError } from "astro/errors"
import { z } from "astro/zod"

export function verifySchema<T extends z.Schema>(
  schema: T,
  toVerify: unknown,
  errorMessage: string | ((id: string | undefined) => string),
  hint: string | ((id: string | undefined) => string),
): z.output<T> {
  const parsed = schema.safeParse(toVerify, {})
  if (parsed.success) {
    return parsed.data
  }

  throwParseError(toVerify, errorMessage, hint, parsed)
}

function throwParseError(
  toVerify: unknown,
  errorMessage: string | ((id: string | undefined) => string),
  hint: string | ((id: string | undefined) => string),
  parsed: z.ZodSafeParseError<unknown>,
): never {
  const id = z.object({ id: z.string() }).safeParse(toVerify).data?.id
  const message =
    typeof errorMessage === "string" ? errorMessage : errorMessage(id)
  const hintFinal = typeof hint === "string" ? hint : hint(id)
  const issues = parsed.error.issues
    .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
    .join("\n")
  throw new AstroError(message, `${hintFinal}\n\n${issues}`)
}
