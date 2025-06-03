import { compareMediaCollectionItems } from "./compare-media-collection-items"
import type { MediaItemEntry } from "./content-schema-internal"

export type MediaItemQuery<TMediaItem extends MediaItemEntry> = {
  /**
   * A filter for multiple fields will be logically combined using AND (&&).
   */
  where?: {
    type?: TMediaItem["data"]["type"]["id"]
    language?: string
    category?: NonNullable<TMediaItem["data"]["categories"]>[number]["id"]
    collection?: NonNullable<
      TMediaItem["data"]["collections"]
    >[number]["collection"]["id"]
  }
  orderBy?: "dateCreated" | "title"
  limit?: number
}

export const queryMediaItems = async <TMediaItem extends MediaItemEntry>(
  allItems: Promise<TMediaItem[]>,
  query: MediaItemQuery<TMediaItem>,
) => {
  const { where = {}, orderBy, limit } = query
  const filters: { (item: TMediaItem): boolean }[] = []

  if (where.type) {
    filters.push((item) => item.data.type.id === where.type)
  }
  if (where.language) {
    filters.push((item) => item.data.language === where.language)
  }
  if (where.category) {
    filters.push(
      (item) => !!item.data.categories?.find(({ id }) => id === where.category),
    )
  }
  if (where.collection) {
    filters.push(
      (item) =>
        !!item.data.collections?.find(
          ({ collection }) => collection.id === where.collection,
        ),
    )
  }
  const combinedFilter = (item: TMediaItem) =>
    filters.every((filter) => filter(item))

  const items = (await allItems).filter(combinedFilter)

  if (orderBy === "dateCreated") {
    items.sort((item1, item2) =>
      item2.data.dateCreated.localeCompare(item1.data.dateCreated),
    )
  }
  if (orderBy === "title") {
    items.sort((item1, item2) =>
      item1.data.title.localeCompare(item2.data.title),
    )
  }
  const { collection } = where
  if (!orderBy && collection) {
    items.sort((a, b) => compareMediaCollectionItems(a, b, collection))
  }

  return items.slice(0, limit)
}
