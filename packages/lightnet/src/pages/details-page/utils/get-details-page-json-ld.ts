import { getImage } from "astro:assets"

import { getCategory } from "../../../content/get-categories"
import { getMediaItem } from "../../../content/get-media-items"
import { getMediaType } from "../../../content/get-media-types"
import type { TranslateContentFieldFn } from "../../../i18n/translate-map"
import { detailsPagePath } from "../../../utils/paths"
import { createMediaItemJsonLd } from "./create-media-item-json-ld"
import { getTranslations } from "./get-translations"

export async function getDetailsPageJsonLd({
  mediaId,
  fallbackSchemaType,
  site,
  defaultLocale,
  tContentField,
}: {
  mediaId: string
  fallbackSchemaType: string
  site: URL | undefined
  defaultLocale: string
  tContentField: TranslateContentFieldFn
}) {
  const item = await getMediaItem(mediaId)
  const mediaType = await getMediaType(item.data.type.id)
  const getCanonicalUrl = (id: string) =>
    new URL(detailsPagePath(defaultLocale, { id }), site)
  const canonicalUrl = getCanonicalUrl(mediaId)
  const translations = (await getTranslations(mediaId))
    .filter(({ language }) => language !== item.data.language)
    .map(({ id, language }) => ({
      canonicalUrl: getCanonicalUrl(id),
      language,
    }))
  const image = await getImage({ src: item.data.image, format: "webp" })
  const categories = await Promise.all(
    (item.data.categories ?? []).map(({ id }) =>
      getCategory(id, tContentField),
    ),
  )

  return createMediaItemJsonLd({
    item: item.data,
    fallbackSchemaType,
    schemaType: mediaType.data.schemaType,
    canonicalUrl,
    imageUrl: new URL(image.src, site).href,
    categoryNames: categories.map((category) => category.labelText),
    contentLabels: item.data.content.map(({ label }) =>
      label ? tContentField(label, item) : undefined,
    ),
    translations,
  })
}
