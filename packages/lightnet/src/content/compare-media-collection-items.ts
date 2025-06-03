import type { MediaItemEntry } from "./content-schema-internal"

export function compareMediaCollectionItems(
  item1: MediaItemEntry,
  item2: MediaItemEntry,
  collectionId: string,
) {
  const getIndex = (item: MediaItemEntry) =>
    item.data.collections?.find(
      ({ collection }) => collection.id === collectionId,
    )?.index
  const index1 = getIndex(item1)
  const index2 = getIndex(item2)
  if (index1 === index2) {
    return item1.id.localeCompare(item2.id)
  }
  if (index1 === undefined && index2 !== undefined) {
    return 1
  }
  if (index1 !== undefined && index2 === undefined) {
    return -1
  }
  return index1! - index2!
}
