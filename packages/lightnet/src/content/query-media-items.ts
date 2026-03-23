import type { MediaCollectionEntry, MediaItemEntry } from "./content-schema"

export type MediaItemQuery<TMediaItem extends MediaItemEntry> = {
  /**
   * A filter for multiple fields will be logically combined using AND (&&).
   */
  where?: {
    type?: TMediaItem["data"]["type"]["id"]
    language?: string
    category?: NonNullable<TMediaItem["data"]["categories"]>[number]["id"]
    collection?: MediaCollectionEntry["id"]
  }
  orderBy?: "dateCreated" | "title"
  limit?: number
}

export const queryMediaItems = async <TMediaItem extends MediaItemEntry>(
  allItems: Promise<TMediaItem[]>,
  mediaCollections: Promise<MediaCollectionEntry[]>,
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

  let mediaCollection: MediaCollectionEntry | undefined
  if (where.collection) {
    mediaCollection = (await mediaCollections).find(
      (mc) => mc.id === where.collection,
    )
    const mediaIdsInCollection = new Set(
      mediaCollection?.data.mediaItems.map(({ id }) => id),
    )
    filters.push((item) => mediaIdsInCollection.has(item.id))
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

  if (!orderBy && mediaCollection) {
    const positionMap = new Map<string, number>()
    mediaCollection.data.mediaItems.forEach((item, index) =>
      positionMap.set(item.id, index),
    )

    items.sort(
      (item1, item2) =>
        (positionMap.get(item1.id) ?? -1) - (positionMap.get(item2.id) ?? -1),
    )
  }

  return items.slice(0, limit)
}
