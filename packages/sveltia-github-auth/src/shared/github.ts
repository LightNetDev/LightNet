import { z } from "zod"

import type { Env } from "./env"

/** Printable ASCII token as issued by GitHub (access and refresh tokens). */
export const tokenSchema = z
  .string()
  .min(1)
  .max(4096)
  .regex(/^[\x21-\x7E]+$/)

/**
 * Token endpoint response. GitHub Apps with expiring user tokens also return a
 * refresh token; OAuth apps only return an access token.
 */
export const tokenResponseSchema = z
  .looseObject({
    access_token: tokenSchema.optional(),
    refresh_token: tokenSchema.optional(),
    expires_in: z.number().int().nonnegative().optional(),
    refresh_token_expires_in: z.number().int().nonnegative().optional(),
    token_type: z.string().max(64).optional(),
    scope: z.string().max(1024).optional(),
    error: z.string().min(1).max(1024).optional(),
    error_description: z.string().max(1024).optional(),
  })
  .refine(({ access_token, error }) => Boolean(access_token || error))

export type TokenResponse = z.infer<typeof tokenResponseSchema>

export const getClientCredentials = ({
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
}: Env) =>
  GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET
    ? { client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET }
    : undefined

/**
 * Requests a token from GitHub, adding the client credentials to the grant
 * parameters. Reports whether GitHub was unreachable or replied with
 * malformed data instead of throwing.
 */
export const requestToken = async (
  params: Record<string, string>,
  credentials: { client_id: string; client_secret: string },
): Promise<
  | { ok: true; data: TokenResponse }
  | { ok: false; reason: "unreachable" | "malformed" }
> => {
  let response: Response
  try {
    response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...params, ...credentials }),
    })
  } catch {
    return { ok: false, reason: "unreachable" }
  }

  try {
    const result = tokenResponseSchema.safeParse(await response.json())
    return result.success
      ? { ok: true, data: result.data }
      : { ok: false, reason: "malformed" }
  } catch {
    return { ok: false, reason: "malformed" }
  }
}
