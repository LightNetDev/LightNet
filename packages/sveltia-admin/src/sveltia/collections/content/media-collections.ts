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
  fields: [
    inlineTranslation({
      name: "label",
      label: "Name",
    }),
    {
      name: "mediaItems",
      label: "Media Items",
      label_singular: "Media Item",
      widget: "list",
      hint: "The list order defines the item order in this collection.",
      summary: "{{fields.mediaItem}}",
      collapsed: true,
      field: {
        name: "mediaItem",
        label: "Media Item",
        widget: "relation",
        collection: "media",
        value_field: "{{slug}}",
        display_fields: ["{{title}} ({{slug}})"],
        search_fields: ["{{title}}", "{{slug}}"],
        dropdown_threshold: 1,
      },
    },
  ],
}
