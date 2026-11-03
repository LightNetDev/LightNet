---
"lightnet": minor
"@lightnet/sveltia-admin": minor
---

Support `SoftwareApplication` and `WebPage` as media type structured data classifications in JSON definitions and the admin interface. For these types, use the first content entry's HTTP(S) link as the resource URL and identify the LightNet detail page with `mainEntityOfPage`. Retain the detail URL when the first entry is an upload or has no valid HTTP(S) URL.
