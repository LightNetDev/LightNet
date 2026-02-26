const ADMIN_PATH_TOKEN = "__LIGHTNET_ADMIN_PATH__"

export const mediaItemEditButtonControllerSource = `
const parseCachedUser = () => {
  try {
    const cachedUser = localStorage.getItem("sveltia-cms.user")
    return cachedUser ? JSON.parse(cachedUser) : undefined
  } catch {
    return undefined
  }
}

export default {
  shouldShow: () => {
    if (import.meta.env.DEV) {
      return true
    }

    const cachedUser = parseCachedUser()
    return (
      typeof cachedUser === "object" &&
      cachedUser !== null &&
      typeof cachedUser.backendName === "string"
    )
  },
  createHref: (mediaId) =>
    "${ADMIN_PATH_TOKEN}#/collections/media/entries/" +
    encodeURIComponent(mediaId),
}
`

export function mediaItemButtonController(path: string): string {
  return mediaItemEditButtonControllerSource.replaceAll(ADMIN_PATH_TOKEN, path)
}
