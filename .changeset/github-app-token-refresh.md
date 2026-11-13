---
"@lightnet/sveltia-github-auth": minor
---

Support GitHub Apps with expiring user access tokens. The callback now passes GitHub's refresh token to Sveltia CMS, and the new `handleRefresh` handler exchanges it for a new access token, adding the client secret and answering CORS requests only from `ALLOWED_ORIGINS`. Route `POST` and `OPTIONS` requests for `/auth` and `/oauth/access_token` to `handleRefresh` so users stay signed in beyond the 8-hour token lifetime. OAuth apps keep working unchanged.
