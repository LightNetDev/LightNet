import { AstroError } from "astro/errors"
import { getCollection } from "astro:content"

import type { TranslateMapFn } from "../i18n/translate-map"
import { lazy } from "../utils/lazy"
import { verifySchemaAsync } from "../utils/verify-schema"
import { getMediaItems } from "./get-media-items"
import { categoryEntrySchema } from "./schema/category"

const labelPath = (id: string) => ["categories", id, "label"]

const categoriesById = lazy(async () =>
  Object.fromEntries(
    (await loadCategories()).map(({ id, data }) => [id, data]),
  ),
)

const contentCategoryIds = lazy(async () => {
  const categories = await categoriesById.get()
  return new Set<string>(
    (await getMediaItems())
      .flatMap((item) => item.data.categories ?? [])
      .map(({ id }) => {
        const category = categories[id]
        if (!category) {
          throw new AstroError(
            "Missing Category",
            `A media item references a non-existent category: "${id}".\n` +
              `To fix this, create a category file at:\n` +
              `src/content/categories/${id}.json`,
          )
        }
        return id
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
  tMap: TranslateMapFn,
) {
  const usedIds = await contentCategoryIds.get()
  // we intentionally translate all categories because we want
  // to record translations also for unreferenced categories
  const categories = await getCategories(currentLocale, tMap)
  return categories.filter(({ id }) => usedIds.has(id))
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
  tMap: TranslateMapFn,
) {
  const categories = await categoriesById.get()
  return [...Object.entries(categories)]
    .map(([id, data]) => ({
      id,
      ...data,
      labelText: tMap(data.label, { path: labelPath(id) }),
    }))
    .sort((a, b) => a.labelText.localeCompare(b.labelText, currentLocale))
}

export async function getCategory(id: string, tMap: TranslateMapFn) {
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
    labelText: tMap(category.label, { path: labelPath(id) }),
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
