import type { Collection } from "@sveltia/cms"
import config from "virtual:lightnet/config"

import { projectPath } from "../utils/paths"
import { inlineTranslation } from "./fields/inline-translation"

export const mediaTypeCollection: Collection = {
  name: "media-types",
  label: "Media Types",
  description:
    "Use media types to organize media items by format. Examples: books, videos, audio. [Read documentation](https://docs.lightnet.community/content/media-types/)",
  label_singular: "Media Type",
  folder: projectPath("src/content/media-types"),
  format: "json",
  identifier_field: "englishName",
  summary: `{{label.${config.defaultLocale}}}  ({{slug}})`,
  fields: [
    {
      name: "englishName",
      label: "English Name",
      required: false,
      hint: "Used only to create the entry ID. If empty, a random ID is generated.",
    },
    inlineTranslation({ name: "label", label: "Name" }),
    {
      name: "icon",
      label: "Icon",
      pattern: [
        "(?:mdi|lucide)--.+",
        "Icon name must start with mdi-- or lucide--",
      ],
      widget: "string",
      hint: "Browse Lucide icons at https://lucide.dev/icons/ and enter the icon name with the 'lucide--' prefix, for example 'lucide--book-open'.",
    },
    {
      name: "coverImageStyle",
      label: "Cover Image Style",
      widget: "select",
      default: "default",
      options: ["default", "book", "video"],
    },
    {
      name: "detailsPage",
      required: false,
      typeKey: "layout",
      label: "Details Page Configuration",
      default: {},
      widget: "object",
      types: [
        {
          name: "default",
          label: "Default",
          fields: [
            inlineTranslation({
              name: "openActionLabel",
              label: "Open Action Label",
              required: false,
              collapsed: "auto",
            }),
          ],
        },
        {
          name: "custom",
          label: "Custom",
          fields: [
            {
              name: "customComponent",
              required: true,
              label: "Custom Component",
              widget: "string",
            },
          ],
        },
        {
          name: "video",
          label: "Video",
        },
        {
          name: "audio",
          label: "Audio",
        },
      ],
    },
  ],
}
