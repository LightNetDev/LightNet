---
"@lightnet/sveltia-admin": minor
---

The GitHub backend's `baseUrl` now defaults to `<site origin>/_auth`, where `@lightnet/sveltia-github-auth` serves sign-in when it runs in the site's own Worker. Sites with a separate authenticator keep setting `baseUrl`. Before, an unset `baseUrl` used Sveltia CMS's default, Netlify's authentication service at `https://api.netlify.com`; sites that rely on it must now set `baseUrl: "https://api.netlify.com"`.
