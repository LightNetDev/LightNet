import { categoriesCollection } from "./categories"
import { mediaCollectionCollection } from "./media-collections"
import { mediaItemCollection } from "./media-items"
import { mediaTypeCollection } from "./media-types"

export const contentCollections = [
  mediaItemCollection,
  { divider: true },
  categoriesCollection,
  mediaCollectionCollection,
  mediaTypeCollection,
]
