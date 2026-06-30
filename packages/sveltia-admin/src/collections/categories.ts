import type { Collection } from "@sveltia/cms"
import config from "virtual:lightnet/config"
import adminConfig from "virtual:lightnet/sveltiaAdminConfig"

import { projectPath } from "../utils/paths"
import { inlineTranslation } from "./fields/inline-translation"

export const categoriesCollection: Collection = {
  name: "categories",
  label: "Categories",
  description:
    "Use categories to group related media items by topic. Examples: discipleship, youth, prayer. [Read documentation](https://docs.lightnet.community/content/categories/)",
  label_singular: "Category",
  folder: projectPath("src/content/categories"),
  create: true,
  hide: !adminConfig.experimental.useCategoriesCollection,
  format: "json",
  identifier_field: `label.${config.defaultLocale}`,
  fields: [
    inlineTranslation({ name: "label", label: "Name" }),
    {
      name: "image",
      label: "Image",
      required: false,
      choose_url: false,
      widget: "image",
      media_folder: "./images",
      accept: "image/png, image/jpeg, image/webp, image/gif",
      hint: "Upload an image for this category. A square image works best. LightNet may resize it and change the file format.",
    },
  ],
}
