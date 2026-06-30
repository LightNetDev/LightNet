import type { Collection } from "@sveltia/cms"
import config from "virtual:lightnet/config"
import adminConfig from "virtual:lightnet/sveltiaAdminConfig"

import { projectPath } from "../utils/paths"
import { inlineTranslation } from "./fields/inline-translation"

export const mediaCollectionCollection: Collection = {
  name: "media-collections",
  label: "Media Collections",
  description:
    "Use media collections to group related media items in order. Examples: a course, a series, a study path. [Read documentation](https://docs.lightnet.community/content/media-collections/)",
  label_singular: "Media Collection",
  create: true,
  hide: !adminConfig.experimental.useMediaCollectionsCollection,
  folder: projectPath("src/content/media-collections"),
  format: "json",
  identifier_field: `label.${config.defaultLocale}`,
  fields: [
    inlineTranslation({
      name: "label",
      label: "Name",
      hint: "Enter the name people should see for this collection.",
    }),
    {
      name: "mediaItems",
      label: "Media Items",
      label_singular: "Media Item",
      widget: "list",
      hint: "Add the media items in the order people should see them.",
      summary: "{{fields.mediaItem}}",
      collapsed: true,
      field: {
        name: "mediaItem",
        label: "Media Item",
        widget: "relation",
        collection: "media",
        display_fields: ["{{title}} ({{slug}})"],
        search_fields: ["{{title}}", "{{slug}}"],
        dropdown_threshold: 1,
      },
    },
  ],
}
