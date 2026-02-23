import type { Collection } from "@sveltia/cms"

import { inlineTranslation } from "../../utils/inline-translation"
import { projectPath } from "../../utils/path"

export const mediaTypeCollection: Collection = {
  name: "media-types",
  label: "Media Types",
  label_singular: "Media Type",
  folder: projectPath("src/content/media-types"),
  summary: "{{filename}}",
  format: "json",
  slug: "{{fields._slug}}",
  fields: [
    inlineTranslation({ name: "label", label: "Name" }),
    {
      name: "icon",
      label: "Icon",
      prefix: "mdi--",
      widget: "string",
      hint: "Find available icons on https://pictogrammers.com/library/mdi/.",
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
