const lightnetFramePatterns = [
  "/packages/lightnet/",
  "/node_modules/lightnet/",
  "src/i18n/translate-map",
]

const normalizeStackPath = (path: string) =>
  path
    .replace(/^file:\/\//, "")
    .replace(process.cwd().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), ".")
    .replace(/^\.\//, "")

export const getTranslationCallsite = () => {
  const stack = new Error().stack?.split("\n").slice(1) ?? []

  const userFrame = stack.find(
    (frame) =>
      frame.includes("at ") &&
      !lightnetFramePatterns.some((pattern) => frame.includes(pattern)),
  )

  if (!userFrame) {
    return
  }

  const match = userFrame.match(/\(?((?:file:\/\/)?[^():]+):(\d+):(\d+)\)?/)
  if (!match) {
    return userFrame.trim()
  }

  const [, file, line, column] = match
  return `${normalizeStackPath(file)}:${line}:${column}`
}
