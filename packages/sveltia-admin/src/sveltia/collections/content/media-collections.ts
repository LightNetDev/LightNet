import type { Collection } from "@sveltia/cms"

import { inlineTranslation } from "../../utils/inline-translation"
import { projectPath } from "../../utils/path"
import config from "virtual:lightnet/config"

export const mediaCollectionCollection: Collection = {
  name: "media-collections",
  label: "Media Collections",
  label_singular: "Media Collection",
  create: true,
  folder: projectPath("src/content/media-collections"),
  format: "json",
  slug: "{{fields._slug}}",
  summary: `{{label.${config.defaultLocale}}}  ({{slug}})`,
  sortable_fields: ["slug", `label`],
  fields: [
    inlineTranslation({
      name: "label",
      label: "Name",
    }),
  ],
}
