/**
 * Creates a lazily initialized value and caches the computed result after the
 * first access.
 *
 * @param compute Function that produces the value when `get()` is called for
 * the first time.
 * @returns An object with a `get()` method that returns the cached value.
 */
export const lazy = <TReturn>(compute: () => TReturn) => {
  let initialized = false
  let value: TReturn
  const get = () => {
    if (!initialized) {
      value = compute()
      initialized = true
    }
    return value
  }
  return { get }
}
