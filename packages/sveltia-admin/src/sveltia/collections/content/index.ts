import { categoriesCollection } from "./categories"
import { languagesCollection } from "./languages"
import { mediaCollectionCollection } from "./media-collections"
import { mediaItemCollection } from "./media-items"
import { mediaTypeCollection } from "./media-types"

export const contentCollections = [
  mediaItemCollection,
  { divider: true },
  categoriesCollection,
  languagesCollection,
  mediaCollectionCollection,
  mediaTypeCollection,
]
