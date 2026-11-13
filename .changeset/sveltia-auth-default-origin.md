---
"@lightnet/sveltia-github-auth": minor
---

`ALLOWED_ORIGINS` is now optional. When it is unset or empty, the handlers allow only the authenticator's own origin, so an authenticator that runs in the same Worker as the CMS site needs no origin configuration. Authenticators on their own domain still need `ALLOWED_ORIGINS` set to the CMS site's origin; without it, sign-in fails with `UNSUPPORTED_DOMAIN` instead of `MISCONFIGURED_ORIGINS`.
