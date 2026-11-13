# @lightnet/sveltia-github-auth

## 1.2.0

### Minor Changes

- [#490](https://github.com/LightNetDev/LightNet/pull/490) [`27c35e7`](https://github.com/LightNetDev/LightNet/commit/27c35e75df5b6b99e6bad50a89441f5ff9b35b5b) - Support GitHub Apps with expiring user access tokens. The callback now passes GitHub's refresh token to Sveltia CMS, and the new `handleRefresh` handler exchanges it for a new access token, adding the client secret and answering CORS requests only from `ALLOWED_ORIGINS`. Route `POST` and `OPTIONS` requests for `/auth` and `/oauth/access_token` to `handleRefresh` so users stay signed in beyond the 8-hour token lifetime. OAuth apps keep working unchanged.

## 1.1.3

### Patch Changes

- [#477](https://github.com/LightNetDev/LightNet/pull/477) [`67d9a6e`](https://github.com/LightNetDev/LightNet/commit/67d9a6eab378697f0baa80b70939b69c8fbdf237) - Update dependencies.

## 1.1.2

### Patch Changes

- [#473](https://github.com/LightNetDev/LightNet/pull/473) [`9e673cf`](https://github.com/LightNetDev/LightNet/commit/9e673cfdc58cab88f96d2f3a22d23b327be626a6) - Update dependencies.

## 1.1.1

### Patch Changes

- [#466](https://github.com/LightNetDev/LightNet/pull/466) [`1ec2a3c`](https://github.com/LightNetDev/LightNet/commit/1ec2a3ccafd83adce62dcd0635fbbe9da5946ee3) - Allow bare hostnames with optional ports in `ALLOWED_ORIGINS`, defaulting them to HTTPS. Continue requiring valid HTTPS origins and reject wildcard hostnames.

## 1.1.0

### Minor Changes

- [#463](https://github.com/LightNetDev/LightNet/pull/463) [`a887aba`](https://github.com/LightNetDev/LightNet/commit/a887abaf65730e3bcce84ba8d0cf05b9cf8feb8e) - Remove the `WORKER_ORIGIN` setting and use the callback URL registered in GitHub instead. Both OAuth requests now omit `redirect_uri`. Configure one HTTPS callback URL with wildcard matching disabled, and use its origin as the CMS backend's `base_url`.

## 1.0.1

### Patch Changes

- [#461](https://github.com/LightNetDev/LightNet/pull/461) [`be09d9c`](https://github.com/LightNetDev/LightNet/commit/be09d9ccdc8ce3a1e486e67accb0c5ae13bb12a6) - Add portable GitHub OAuth authorization and callback handlers for Sveltia CMS, shared with the worker template without Cloudflare API dependencies.

- [#461](https://github.com/LightNetDev/LightNet/pull/461) [`be09d9c`](https://github.com/LightNetDev/LightNet/commit/be09d9ccdc8ce3a1e486e67accb0c5ae13bb12a6) - Allow popup error responses to reach the opener when allowed origins are misconfigured, while retaining origin checks for token responses.
