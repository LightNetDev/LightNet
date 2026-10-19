import { z } from "zod"

import { hasConfiguredAllowedOrigins } from "./shared/allowed-origins"
import { getCallbackUrl } from "./shared/callback-url"
import type { Env } from "./shared/env"
import { outputHTML } from "./shared/output-html"

const callbackQuerySchema = z.object({
  code: z.string().min(1).max(2048),
  state: z.string().regex(/^[a-f0-9]{32}$/),
})

const csrfCookieSchema = z.object({
  provider: z.literal("github"),
  csrfToken: z.string().regex(/^[a-f0-9]{32}$/),
  codeVerifier: z.string().regex(/^[A-Za-z0-9\-._~]{43,128}$/),
})

const tokenResponseSchema = z
  .looseObject({
    access_token: z
      .string()
      .min(1)
      .max(4096)
      .regex(/^[\x21-\x7E]+$/)
      .optional(),
    error: z.string().min(1).max(1024).optional(),
  })
  .refine(({ access_token, error }) => Boolean(access_token || error))

export const handleCallback = async (
  request: Request,
  env: Env,
): Promise<Response> => {
  const { searchParams } = new URL(request.url)
  const query = callbackQuerySchema.safeParse({
    code: searchParams.get("code"),
    state: searchParams.get("state"),
  })
  const [, rawProvider, rawCsrfToken, rawCodeVerifier] =
    request.headers
      .get("Cookie")
      ?.match(
        /(?:^|;\s*)__Host-oauth-state=([a-z-]+?)_([0-9a-f]{32})_([A-Za-z0-9\-._~]{43,128})(?:;|$)/,
      ) ?? []
  const cookie = csrfCookieSchema.safeParse({
    provider: rawProvider,
    csrfToken: rawCsrfToken,
    codeVerifier: rawCodeVerifier,
  })

  if (!cookie.success) {
    return outputHTML({
      env,
      error: "Your Git backend is not supported by the authenticator.",
      errorCode: "UNSUPPORTED_BACKEND",
    })
  }

  const { csrfToken, codeVerifier } = cookie.data

  if (!hasConfiguredAllowedOrigins(env.ALLOWED_ORIGINS)) {
    return outputHTML({
      env,
      error:
        "Allowed origins are not configured. Set ALLOWED_ORIGINS to your site origin.",
      errorCode: "MISCONFIGURED_ORIGINS",
    })
  }

  if (!query.success) {
    return outputHTML({
      env,
      error: "Failed to receive an authorization code. Please try again later.",
      errorCode: "AUTH_CODE_REQUEST_FAILED",
    })
  }

  if (query.data.state !== csrfToken) {
    return outputHTML({
      env,
      error: "Potential CSRF attack detected. Authentication flow aborted.",
      errorCode: "CSRF_DETECTED",
    })
  }

  const redirectUri = getCallbackUrl(env.WORKER_ORIGIN)
  if (!redirectUri) {
    return outputHTML({
      env,
      error:
        "Worker origin is not configured. Set WORKER_ORIGIN to this Worker’s HTTPS origin.",
      errorCode: "MISCONFIGURED_CALLBACK_URL",
    })
  }

  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = env
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return outputHTML({
      env,
      error: "OAuth app client ID or secret is not configured.",
      errorCode: "MISCONFIGURED_CLIENT",
    })
  }

  let response: Response | undefined
  try {
    response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: query.data.code,
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    })
  } catch {
    // The authorization server was unreachable.
  }

  if (!response) {
    return outputHTML({
      env,
      error: "Failed to request an access token. Please try again later.",
      errorCode: "TOKEN_REQUEST_FAILED",
    })
  }

  let tokenResponse
  try {
    tokenResponse = tokenResponseSchema.safeParse(await response.json())
  } catch {
    tokenResponse = { success: false }
  }

  if (!tokenResponse.success || !tokenResponse.data) {
    return outputHTML({
      env,
      error: "Server responded with malformed data. Please try again later.",
      errorCode: "MALFORMED_RESPONSE",
    })
  }

  return outputHTML({
    env,
    token: tokenResponse.data.access_token,
    error: tokenResponse.data.error,
  })
}
