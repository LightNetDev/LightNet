import { getMediaItem, getMediaItems } from "../../../content/get-media-items"

type Translation = { id: string; language: string }

const groupItemsByCommonId = async () => {
  const itemsByCommonId = new Map<string, Translation[]>()
  const items = await getMediaItems()
  items.forEach(({ id, data: { commonId, language } }) => {
    if (!commonId) {
      return
    }
    if (!itemsByCommonId.has(commonId)) {
      itemsByCommonId.set(commonId, [])
    }
    itemsByCommonId.get(commonId)?.push({ id, language })
  })
  itemsByCommonId.forEach((value, key) => {
    if (value.length < 2) {
      itemsByCommonId.delete(key)
    } else {
      value.sort((a, b) => a.language.localeCompare(b.language))
    }
  })
  return itemsByCommonId
}

let itemsByCommonIdPromise: Promise<Map<string, Translation[]>> | undefined

const getGroup = async (mediaId: string) => {
  itemsByCommonIdPromise ??= groupItemsByCommonId()
  const itemsByCommonId = await itemsByCommonIdPromise
  const { commonId } = (await getMediaItem(mediaId)).data
  return commonId ? itemsByCommonId.get(commonId) : undefined
}

/**
 * Get all other media items that share the commonId of the given media item,
 * sorted by language.
 */
export const getTranslations = async (mediaId: string) =>
  (await getGroup(mediaId))?.filter(({ id }) => id !== mediaId) ?? []

/**
 * Get the language versions of the given media item for hreflang alternate
 * links: all media items sharing its commonId, including itself, sorted by
 * language.
 *
 * Search engines expect exactly one URL per language. When two media items of
 * a group share a language, it is unclear which one represents that language,
 * so no alternates are returned for the whole group.
 */
export const getLanguageAlternates = async (mediaId: string) => {
  const group = (await getGroup(mediaId)) ?? []
  const languages = new Set(group.map(({ language }) => language))
  return languages.size === group.length ? group : []
}
