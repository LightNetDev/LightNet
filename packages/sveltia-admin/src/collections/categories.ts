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
  hide:
    adminConfig.experimental &&
    !adminConfig.experimental.useCategoriesCollection,
  format: "json",
  identifier_field: "englishName",
  summary: `{{label.${config.defaultLocale}}}  ({{slug}})`,
  fields: [
    {
      name: "englishName",
      label: "English Name",
      required: false,
      hint: "Used only for new items to generate the entry ID. If empty, a random ID is generated.",
    },
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
