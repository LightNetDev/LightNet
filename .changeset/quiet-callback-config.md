---
"@lightnet/sveltia-github-auth": minor
---

Remove the `WORKER_ORIGIN` setting and use the callback URL registered in GitHub instead. Both OAuth requests now omit `redirect_uri`. Configure one HTTPS callback URL with wildcard matching disabled, and use its origin as the CMS backend's `base_url`.
