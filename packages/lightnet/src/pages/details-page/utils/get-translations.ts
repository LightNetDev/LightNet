import { getMediaItem, getMediaItems } from "../../../content/get-media-items"

const groupItemsByCommonId = async () => {
  const items = await getMediaItems()
  items.forEach(({ id, data: { commonId, language } }) => {
    if (!itemsByCommonId.has(commonId)) {
      itemsByCommonId.set(commonId, [])
    }
    itemsByCommonId.get(commonId)?.push({ id, language })
  })
  itemsByCommonId.forEach((value, key) => {
    if (value.length < 2) {
      itemsByCommonId.delete(key)
    }
  })
}

let isInitialized = false
const itemsByCommonId = new Map<string, { id: string, language: string }[]>()

export const getTranslations = async (mediaId: string) => {
  if (!isInitialized) {
    isInitialized = true
    await groupItemsByCommonId()
  }
  const item = await getMediaItem(mediaId)
  const sameCommonId = itemsByCommonId.get(item.data.commonId)
  if (!sameCommonId) {
    return []
  }
  return sameCommonId
    .filter(({ id }) => id !== mediaId)
    .sort((a, b) => a.language.localeCompare(b.language))
}