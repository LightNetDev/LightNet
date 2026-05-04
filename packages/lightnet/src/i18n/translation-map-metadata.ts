import { z } from "astro/zod"

const inlineMapMarker = "ln.is-translation-map"
const inlineMapPath = "path"

export function getPath(translationMap: Record<PropertyKey, unknown>) {
  const path = translationMap[inlineMapPath] ?? []
  return z.string().array().parse(path)
}

export function attachMarker(value: unknown) {
  Object.defineProperty(value, inlineMapMarker, {
    value: true,
  })
}

export function attachTranslationMapMetadata(
  data: Record<string, unknown>,
  path: string[],
) {
  if (typeof data["id"] === "string" && typeof data["data"] === "object") {
    // astro content collection
    attachTranslationMapPaths(data.data, [...path, data["id"]])
  } else {
    attachTranslationMapPaths(data, path)
  }
}

function attachTranslationMapPaths(data: unknown, path: string[]) {
  if (!data) {
    return
  }
  if (!(typeof data === "object")) {
    return
  }
  if (!Object.hasOwn(data, inlineMapMarker)) {
    for (const [key, value] of Object.entries(data)) {
      attachTranslationMapPaths(value, [...path, key])
    }
    return
  }
  Object.defineProperty(data, inlineMapPath, { value: path, enumerable: true })
}
