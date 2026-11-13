import { z } from "zod"

import {
  getAllowedOrigins,
  hasConfiguredAllowedOrigins,
  withDefaultAllowedOrigins,
} from "./shared/allowed-origins"
import type { Env } from "./shared/env"
import {
  getClientCredentials,
  requestToken,
  tokenSchema,
} from "./shared/github"

// Sveltia CMS also sends `client_id`, which is ignored in favor of the
// configured one.
const refreshRequestSchema = z.looseObject({
  grant_type: z.literal("refresh_token"),
  refresh_token: tokenSchema,
})

const maxBodyLength = 8192

/**
 * CORS headers for allowed origins. The `Origin` header can be forged outside
 * a browser, so this only stops other sites from using the worker; the refresh
 * token itself authorizes the refresh.
 */
const getCorsHeaders = (request: Request, env: Env) => {
  const origin = request.headers.get("Origin")
  if (
    !origin ||
    !hasConfiguredAllowedOrigins(env.ALLOWED_ORIGINS) ||
    !getAllowedOrigins(env.ALLOWED_ORIGINS).includes(origin)
  ) {
    return
  }
  return {
    "Access-Control-Allow-Origin": origin,
    // Sveltia CMS sends cookies when the `include_credentials` option is set.
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Accept, Content-Type",
    "Access-Control-Max-Age": "86400",
  }
}

const outputJSON = (
  body: Record<string, unknown>,
  status: number,
  headers: Record<string, string> = {},
) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", Vary: "Origin", ...headers },
  })

const readBody = async (request: Request) => {
  try {
    const text = await request.text()
    return text.length > maxBodyLength ? undefined : JSON.parse(text)
  } catch {
    return
  }
}

/**
 * Refreshes an expired GitHub App user access token for Sveltia CMS. The
 * refresh requires the client secret, so the CMS cannot call GitHub directly.
 * Handles both the `POST` request and its CORS preflight (`OPTIONS`).
 */
export const handleRefresh = async (
  request: Request,
  configuredEnv: Env,
): Promise<Response> => {
  const env = withDefaultAllowedOrigins(request, configuredEnv)
  const corsHeaders = getCorsHeaders(request, env)

  if (!corsHeaders) {
    return outputJSON({ error: "unsupported_domain" }, 403)
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { ...corsHeaders, Vary: "Origin" },
    })
  }

  if (request.method !== "POST") {
    return outputJSON({ error: "method_not_allowed" }, 405, {
      ...corsHeaders,
      Allow: "POST, OPTIONS",
    })
  }

  const body = refreshRequestSchema.safeParse(await readBody(request))
  if (!body.success) {
    return outputJSON({ error: "invalid_request" }, 400, corsHeaders)
  }

  const credentials = getClientCredentials(env)
  if (!credentials) {
    return outputJSON({ error: "misconfigured_client" }, 500, corsHeaders)
  }

  const result = await requestToken(
    { grant_type: "refresh_token", refresh_token: body.data.refresh_token },
    credentials,
  )

  if (!result.ok) {
    return outputJSON({ error: "token_request_failed" }, 502, corsHeaders)
  }

  const { data } = result

  // GitHub reports an invalid or expired refresh token with `200 OK` and an
  // `error` property.
  if (data.error || !data.access_token) {
    return outputJSON(
      {
        error: data.error ?? "token_request_failed",
        error_description: data.error_description,
      },
      400,
      corsHeaders,
    )
  }

  return outputJSON(
    {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      refresh_token_expires_in: data.refresh_token_expires_in,
      token_type: data.token_type,
      scope: data.scope,
    },
    200,
    corsHeaders,
  )
}
