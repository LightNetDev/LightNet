import type { Collection } from "@sveltia/cms"
import lightnetConfig from "virtual:lightnet/config"
import sveltiaAdminConfig from "virtual:lightnet/sveltiaAdminConfig"

import { inlineTranslation } from "../utils/inline-translation"

export const languagesCollection: Collection = {
  name: "languages",
  label: "Languages",
  folder: `${sveltiaAdminConfig.baseFolder}src/config/languages`,
  format: "json",
  summary: `{{label.${lightnetConfig.defaultLocale}}}`,
  slug: "{{fields._slug}}",
  fields: [inlineTranslation({ name: "label", label: "Name" })],
}
