import type { Collection } from "@sveltia/cms"
import config from "virtual:lightnet/config"

import { inlineTranslation } from "../../utils/inline-translation"
import { projectPath } from "../../utils/path"

export const mediaTypeCollection: Collection = {
  name: "media-types",
  label: "Media Types",
  description:
    "Define different content formats. Examples: books, videos, audio. [Read documentation](https://docs.lightnet.community/content/media-types/)",
  label_singular: "Media Type",
  folder: projectPath("src/content/media-types"),
  format: "json",
  slug: "{{fields._slug}}",
  summary: `{{label.${config.defaultLocale}}}  ({{slug}})`,
  sortable_fields: [`label.${config.defaultLocale}`, "slug"],
  fields: [
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
