import { useRef } from "react"

export function useDebounce<T>(
  callback: (...args: T[]) => unknown,
  time: number,
) {
  const timeout = useRef<number>(undefined)
  return (...args: T[]) => {
    if (timeout.current) {
      window.clearTimeout(timeout.current)
    }
    timeout.current = window.setTimeout(() => {
      callback(...args)
      timeout.current = undefined
    }, time)
  }
}
