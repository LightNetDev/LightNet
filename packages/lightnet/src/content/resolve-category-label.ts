import { AstroError } from "astro/errors"
import { getCollection } from "astro:content"

import type { TranslateFn } from "../i18n/translate"

const categories = await getCollection("categories")

export const resolveCategoryLabel = (
  translate: TranslateFn,
  categoryId: string,
) => {
  const category = categories.find((c) => c.id === categoryId)
  if (!category) {
    throw new AstroError(
      `Missing category "${categoryId}"`,
      `To fix the issue, add a category at "src/content/categories/${categoryId}.json".`,
    )
  }
  return translate(category.data.label)
}
