export const writeFile = (
  path: string,
  body: BodyInit,
  contentType?: string,
) => {
  return fetch(
    `/api/internal/fs/write-file?path=${encodeURIComponent(path.replace(/^\//, ""))}`,
    {
      method: "POST",
      headers: { "Content-Type": contentType ?? resolveContentType(path) },
      body,
    },
  )
}

export const writeJson = async (path: string, object: unknown) => {
  return writeFile(path, JSON.stringify(sortObject(object), null, 2))
}

const resolveContentType = (path: string) => {
  const normalizedPath = path.trim().toLowerCase()
  return normalizedPath.endsWith(".json")
    ? "application/json"
    : "text/plain; charset=utf-8"
}

const sortObject = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortObject)
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => (a > b ? 1 : a < b ? -1 : 0))
      .map(([key, nestedValue]) => [key, sortObject(nestedValue)])

    return Object.fromEntries(entries)
  }

  return value
}
