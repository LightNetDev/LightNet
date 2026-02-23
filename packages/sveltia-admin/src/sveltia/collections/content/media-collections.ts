import type { Collection } from "@sveltia/cms"

import { inlineTranslation } from "../../utils/inline-translation"
import { projectPath } from "../../utils/path"

export const mediaCollectionCollection: Collection = {
  name: "media-collections",
  label: "Media Collections",
  label_singular: "Media Collection",
  create: true,
  folder: projectPath("src/content/media-collections"),
  format: "json",
  slug: "{{fields._slug}}",
  summary: "{{filename}}",
  sortable_fields: ["slug"],
  fields: [
    inlineTranslation({
      name: "label",
      label: "Name",
    }),
  ],
}
