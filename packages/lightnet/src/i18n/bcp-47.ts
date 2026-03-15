export const isBcp47 = (value: string) => {
  try {
    new Intl.Locale(value)
    return true
  } catch {
    return false
  }
}
