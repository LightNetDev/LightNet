import type { Collection } from "@sveltia/cms"
import sveltiaAdminConfig from "virtual:lightnet/sveltiaAdminConfig"

import { inlineTranslation } from "../../utils/inline-translation"

export const mediaCollectionCollection: Collection = {
  name: "media-collections",
  label: "Media Collections",
  label_singular: "Media Collection",
  create: true,
  folder: `${sveltiaAdminConfig.siteRootInRepo}src/content/media-collections`,
  format: "json",
  slug: "{{fields._slug}}",
  summary: "{{filename}}",
  fields: [
    inlineTranslation({
      name: "label",
      label: "Name",
    }),
  ],
}
