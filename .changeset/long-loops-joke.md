---
"lightnet": minor
---

Introduce DetailsPage wrapper component

‼️ BREAKING CHANGE on experimental custom details page API.

With this change all custom details pages need to be wrapped by
a `DetailsPage` component. This component is exported by `@lightnet/experimental-details-page`.
Previously custom details pages were automatically wrapped by LightNet.

This is how to create a custom details page:

```astro
---
import { DetailsPage } from "@lightNet/experimental-details-page"
type Props = {
  mediaId
}
---

<DetailsPage mediaId={Astro.props.mediaId}>
  {/* Your custom details page components go here */}
</DetailsPage>
```
