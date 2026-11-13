import { z } from "zod"

import {
  hasConfiguredAllowedOrigins,
  withDefaultAllowedOrigins,
} from "./shared/allowed-origins"
import type { Env } from "./shared/env"
import { getClientCredentials, requestToken } from "./shared/github"
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

export const handleCallback = async (
  request: Request,
  configuredEnv: Env,
): Promise<Response> => {
  const env = withDefaultAllowedOrigins(request, configuredEnv)
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
        "Allowed origins are misconfigured. Set ALLOWED_ORIGINS to your site's HTTPS origin, or leave it empty to allow only this authenticator's origin.",
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

  const credentials = getClientCredentials(env)
  if (!credentials) {
    return outputHTML({
      env,
      error: "GitHub client ID or secret is not configured.",
      errorCode: "MISCONFIGURED_CLIENT",
    })
  }

  const result = await requestToken(
    { code: query.data.code, code_verifier: codeVerifier },
    credentials,
  )

  if (!result.ok) {
    return result.reason === "unreachable"
      ? outputHTML({
          env,
          error: "Failed to request an access token. Please try again later.",
          errorCode: "TOKEN_REQUEST_FAILED",
        })
      : outputHTML({
          env,
          error:
            "Server responded with malformed data. Please try again later.",
          errorCode: "MALFORMED_RESPONSE",
        })
  }

  return outputHTML({
    env,
    token: result.data.access_token,
    refreshToken: result.data.refresh_token,
    error: result.data.error,
  })
}
