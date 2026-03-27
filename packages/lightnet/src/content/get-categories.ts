import { AstroError } from "astro/errors"
import { getCollection } from "astro:content"

import type { InlineTranslateFn } from "../i18n/inline-translation"
import { lazy } from "../utils/lazy"
import { verifySchemaAsync } from "../utils/verify-schema"
import { categoryEntrySchema } from "./content-schema"
import { getMediaItems } from "./get-media-items"

const categoriesById = lazy(async () =>
  Object.fromEntries(
    (await loadCategories()).map(({ id, data }) => [id, data]),
  ),
)

const contentCategories = lazy(async () => {
  const categories = await categoriesById.get()
  return Object.fromEntries(
    (await getMediaItems())
      .flatMap((item) => item.data.categories ?? [])
      .map((c) => {
        const category = categories[c.id]
        if (!category) {
          throw new AstroError(
            "Missing Category",
            `A media item references a non-existent category: "${c.id}".\n` +
              `To fix this, create a category file at:\n` +
              `src/content/categories/${c.id}.json`,
          )
        }
        return [c.id, category]
      }),
  )
})

/**
 * Get categories that are referenced from media items.
 * Adds the translated name of the category and sorts by this name.
 *
 * @param currentLocale current locale
 * @returns categories sorted by labelText
 */
export async function getUsedCategories(
  currentLocale: string,
  tInline: InlineTranslateFn,
) {
  const categories = await contentCategories.get()
  return [...Object.entries(categories)]
    .map(([id, data]) => ({
      id,
      ...data,
      labelText: tInline(data.label, {
        path: ["categories", id, "label"],
      }),
    }))
    .sort((a, b) => a.labelText.localeCompare(b.labelText, currentLocale))
}

/**
 * Get all categories. This includes categories that are not
 * referenced by any media item. If you only need categories that are referenced
 * by media items use `getUsedCategories`.
 *
 * @param currentLocale current locale
 * @returns categories sorted by labelText
 */
export async function getCategories(
  currentLocale: string,
  tInline: InlineTranslateFn,
) {
  const categories = await categoriesById.get()
  return [...Object.entries(categories)]
    .map(([id, data]) => ({
      id,
      ...data,
      labelText: tInline(data.label, {
        path: ["categories", id, "label"],
      }),
    }))
    .sort((a, b) => a.labelText.localeCompare(b.labelText, currentLocale))
}

export async function getCategory(id: string) {
  const category = (await categoriesById.get())[id]
  if (!category) {
    throw new AstroError(
      `Missing category "${id}"`,
      `To fix the issue, add a category at "src/content/categories/${id}.json".`,
    )
  }
  return {
    id,
    ...category,
  }
}

async function loadCategories() {
  return Promise.all(
    (await getCollection("categories")).map((category: unknown) =>
      parseCategory(category),
    ),
  )
}

function parseCategory(item: unknown) {
  return verifySchemaAsync(
    categoryEntrySchema,
    item,
    (id) => `Invalid category: ${id}`,
    (id) => `Fix these issues inside "src/content/categories/${id}.json":`,
  )
}
