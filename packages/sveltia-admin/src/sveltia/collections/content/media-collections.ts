import type { Collection } from "@sveltia/cms"
import config from "virtual:lightnet/config"

import { inlineTranslation } from "../../utils/inline-translation"
import { projectPath } from "../../utils/path"

export const mediaCollectionCollection: Collection = {
  name: "media-collections",
  label: "Media Collections",
  description:
    "Group related media items in a specific order. Examples: a course, a series, a study path. [Read documentation](https://docs.lightnet.community/content/media-collections/)",
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
