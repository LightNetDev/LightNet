const DEFAULT_DURATION_MS = 3000
const TIMEOUT_DATA_KEY = "toastHideTimeoutId"
const DEFAULT_HIDDEN_TRANSFORM = "translateY(1.5rem)"
const DEFAULT_VISIBLE_TRANSFORM = "translateY(0)"
const DEFAULT_OVERSHOOT_TRANSFORM = "translateY(-0.25rem)"

type ShowToastOptions = {
  duration?: number
}

/**
 * Shows a toast element by toggling its opacity and schedules it to hide again.
 * Works with markup rendered by the Toast component but can target any element.
 */
export function showToast(element: HTMLElement, options: ShowToastOptions = {}) {
  const duration = options.duration ?? DEFAULT_DURATION_MS
  const existingTimeoutId = element.dataset[TIMEOUT_DATA_KEY]
  const hiddenTransform =
    element.dataset.toastHiddenTransform ?? DEFAULT_HIDDEN_TRANSFORM
  const overshootTransform =
    element.dataset.toastOvershootTransform ?? DEFAULT_OVERSHOOT_TRANSFORM
  const visibleTransform =
    element.dataset.toastVisibleTransform ?? DEFAULT_VISIBLE_TRANSFORM

  if (existingTimeoutId) {
    window.clearTimeout(Number(existingTimeoutId))
  }

  element.style.opacity = "100%"
  element.style.transform = overshootTransform
  element.dataset.toastVisible = "true"

  const settleIntoPlace = () => {
    element.style.transform = visibleTransform
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(settleIntoPlace)
  })

  const timeoutId = window.setTimeout(() => {
    element.style.opacity = "0%"
    element.style.transform = hiddenTransform
    element.dataset.toastVisible = "false"
    delete element.dataset[TIMEOUT_DATA_KEY]
  }, duration)

  element.dataset[TIMEOUT_DATA_KEY] = String(timeoutId)
}

export function showToastById(id: string, options?: ShowToastOptions) {
  const element = document.getElementById(id)
  if (!element) {
    return
  }

  showToast(element as HTMLElement, options)
}
