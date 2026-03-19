import type { Collection } from "@sveltia/cms"
import config from "virtual:lightnet/config"

import { inlineTranslation } from "../../utils/inline-translation"
import { projectPath } from "../../utils/path"

export const categoriesCollection: Collection = {
  name: "categories",
  label: "Categories",
  description:
    "Organize and filter media items by topic. Examples: discipleship, youth, prayer. [Read documentation](https://docs.lightnet.community/content/categories/)",
  label_singular: "Category",
  folder: projectPath("src/content/categories"),
  create: true,
  format: "json",
  slug: "{{fields._slug}}",
  summary: `{{label.${config.defaultLocale}}}  ({{slug}})`,
  fields: [
    inlineTranslation({ name: "label", label: "Name" }),
    {
      name: "image",
      label: "Image",
      required: false,
      widget: "image",
      media_folder: "images",
      pattern: [
        "\\.(jpg|png|jpeg|webp)$",
        "Unsupported image format. Supported formats are jpg, png, webp",
      ],
      hint: "When you upload an image, it is automatically resized (up to 2048 pixels) and saved in a web-friendly format.",
    },
  ],
}
