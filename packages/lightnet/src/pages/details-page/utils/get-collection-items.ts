import { compareMediaCollectionItems } from "../../../content/compare-media-collection-items"
import type { MediaItemEntry } from "../../../content/content-schema"
import { getMediaItems } from "../../../content/get-media-items"

const groupItemsByCollections = async () => {
  const items = await getMediaItems()
  items.forEach((item) => {
    item.data.collections?.forEach(({ collection }) => {
      if (!itemsByCollections.has(collection.id)) {
        itemsByCollections.set(collection.id, [])
      }
      itemsByCollections.get(collection.id)?.push(item)
    })
  })
  itemsByCollections.forEach((entries, collectionId) =>
    entries.sort((a, b) => compareMediaCollectionItems(a, b, collectionId)),
  )
}

let isInitialized = false
const itemsByCollections = new Map<string, MediaItemEntry[]>()

export const getCollectionItems = async (collectionId: string) => {
  if (!isInitialized) {
    isInitialized = true
    await groupItemsByCollections()
  }
  return itemsByCollections.get(collectionId) ?? []
}
