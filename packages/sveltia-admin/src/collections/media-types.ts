import type { Collection } from "@sveltia/cms"
import config from "virtual:lightnet/config"
import adminConfig from "virtual:lightnet/sveltiaAdminConfig"

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
  hide: adminConfig.experimental.hideMediaTypesCollection,
  slug: adminConfig.experimental.showSlugField
    ? "{{fields._slug}}"
    : `{{label.${config.defaultLocale}}}`,
  summary: `{{label.${config.defaultLocale}}}`,
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
      hint: "Enter an Lucide icon name such as 'lucide--book-open'. Browse Lucide icons at https://lucide.dev/icons/.",
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
