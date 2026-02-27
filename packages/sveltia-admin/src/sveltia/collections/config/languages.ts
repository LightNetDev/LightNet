import type { Collection } from "@sveltia/cms"
import config from "virtual:lightnet/config"

import { inlineTranslation } from "../../utils/inline-translation"
import { projectPath } from "../../utils/path"

export const languagesCollection: Collection = {
  name: "languages",
  label: "Languages",
  description:
    "Define site and content languages [[Read documentation]](https://docs.lightnet.community/build/i18n/fundamentals/)",
  folder: projectPath("src/config/languages"),
  format: "json",
  icon: "language",
  slug: "{{code}}",
  summary: `{{label.${config.defaultLocale}}}  ({{slug}})`,
  sortable_fields: ["slug", `label`],
  fields: [
    {
      name: "code",
      label: "Language Code",
      hint: "Enter a valid IETF BCP 47 language tag (for example, en, en-US, ar). Use this [tool](https://r12a.github.io/app-subtags/) to find the right code.",
      pattern: [
        "^(?:(?:[A-Za-z]{2,3}(?:-[A-Za-z]{3}){0,3}|[A-Za-z]{4}|[A-Za-z]{5,8})(?:-[A-Za-z]{4})?(?:-(?:[A-Za-z]{2}|\\d{3}))?(?:-(?:[A-Za-z0-9]{5,8}|\\d[A-Za-z0-9]{3}))*(?:-[0-9A-WY-Za-wy-z](?:-[A-Za-z0-9]{2,8})+)*(?:-x(?:-[A-Za-z0-9]{1,8})+)?|x(?:-[A-Za-z0-9]{1,8})+)$",
        "Enter a valid BCP 47 language tag (e.g. en, en-US, zh-Hans-CN).",
      ],
    },
    inlineTranslation({ name: "label", label: "Name" }),
  ],
}
