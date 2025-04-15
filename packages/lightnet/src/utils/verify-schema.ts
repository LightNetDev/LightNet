import { AstroError } from "astro/errors"
import { z } from "astro/zod"

export async function verifySchemaAsync<T extends z.Schema>(
  schema: T,
  toVerify: unknown,
  errorMessage: string | ((id: string | undefined) => string),
  hint: string | ((id: string | undefined) => string),
): Promise<z.output<T>> {
  const parsed = await schema.safeParseAsync(toVerify)
  if (!parsed.success) {
    throwParseError(toVerify, errorMessage, hint, parsed)
  }
  return parsed.data
}

export function verifySchema<T extends z.Schema>(
  schema: T,
  toVerify: unknown,
  errorMessage: string | ((id: string | undefined) => string),
  hint: string | ((id: string | undefined) => string),
): z.output<T> {
  const parsed = schema.safeParse(toVerify, {})
  if (!parsed.success) {
    throwParseError(toVerify, errorMessage, hint, parsed)
  }
  return parsed.data
}

function throwParseError(
  toVerify: unknown,
  errorMessage: string | ((id: string | undefined) => string),
  hint: string | ((id: string | undefined) => string),
  parsed: z.SafeParseError<unknown>,
) {
  const id = z.object({ id: z.string() }).safeParse(toVerify).data?.id
  const message =
    typeof errorMessage === "string" ? errorMessage : errorMessage(id)
  const hintFinal = typeof hint === "string" ? hint : hint(id)
  const issues = parsed.error.errors
    .map((e) => `- ${e.path.join(".")}: ${e.message}`)
    .join("\n")
  throw new AstroError(message, `${hintFinal}\n\n${issues}`)
}
