const DEFAULT_DURATION_MS = 3000
const TIMEOUT_DATA_KEY = "toastHideTimeoutId"

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

  if (existingTimeoutId) {
    window.clearTimeout(Number(existingTimeoutId))
  }

  element.style.opacity = "100%"
  element.dataset.toastVisible = "true"

  const timeoutId = window.setTimeout(() => {
    element.style.opacity = "0%"
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
