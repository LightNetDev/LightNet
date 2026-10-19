import {
  getAllowedOrigins,
  hasConfiguredAllowedOrigins,
} from "./allowed-origins"
import type { Env } from "./env"

const serialize = (value: unknown) =>
  JSON.stringify(value ?? null).replaceAll("<", "\\u003c")

interface HtmlOptions {
  provider?: string
  token?: string
  error?: string
  errorCode?: string
  env?: Env
}

const provider = "github"

export const outputHTML = ({
  token,
  error,
  errorCode,
  env = {},
}: HtmlOptions): Response => {
  const state = error ? "error" : "success"
  const content = error ? { provider, error, errorCode } : { provider, token }
  const authorizationMessage = `authorization:${provider}:${state}:${JSON.stringify(content)}`

  return new Response(
    `<!doctype html><html><body><script>
      (() => {
        const trustedOrigins = ${serialize(
          hasConfiguredAllowedOrigins(env.ALLOWED_ORIGINS)
            ? getAllowedOrigins(env.ALLOWED_ORIGINS)
            : [],
        )};
        const isTrusted = (origin) => {
          return trustedOrigins.includes(origin);
        };
        window.addEventListener('message', ({ data, origin }) => {
          if (data !== 'authorizing:${provider}') return;
          if (!${Boolean(error)} && !isTrusted(origin)) return;
          window.opener?.postMessage(
            ${serialize(authorizationMessage)}, origin,
          );
        });
        window.opener?.postMessage('authorizing:${provider}', '*');
      })();
    </script></body></html>`,
    {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        "Cache-Control": "no-store",
        Pragma: "no-cache",
        "Referrer-Policy": "no-referrer",
        "Set-Cookie":
          "__Host-oauth-state=deleted; HttpOnly; Max-Age=0; Path=/; SameSite=Lax; Secure",
      },
    },
  )
}
