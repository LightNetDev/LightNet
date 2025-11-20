import { useEffect, useRef, useState } from "react"
import { type Control, useFormState } from "react-hook-form"

import Icon from "../../../components/Icon"
import { useI18n } from "../../../i18n/react/useI18n"
import type { MediaItem } from "../../types/media-item"

const SUCCESS_DURATION_MS = 2000

const baseButtonClass =
  "flex min-w-52 items-center justify-center gap-2 rounded-2xl px-4 py-3 font-bold shadow-sm transition-colors easy-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed"

const buttonStateClasses = {
  idle: "bg-gray-800 text-gray-100 hover:bg-gray-950 hover:text-gray-300 disabled:bg-gray-500 disabled:text-gray-300",
  error:
    "bg-rose-700 text-white hover:bg-rose-800 hover:text-white disabled:bg-rose-600",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white disabled:bg-emerald-500",
} as const

const buttonLabels = {
  idle: import.meta.env.DEV
    ? "ln.admin.save-changes"
    : "ln.admin.publish-changes",
  success: import.meta.env.DEV ? "ln.admin.saved" : "ln.admin.published",
  error: "ln.admin.failed",
} as const

const icons = {
  idle: undefined,
  success: "mdi--check",
  error: "mdi--error-outline",
} as const

export default function SubmitButton({
  control,
  className,
}: {
  control: Control<MediaItem>
  className?: string
}) {
  const { t } = useI18n()
  const { isSubmitting, isSubmitSuccessful, submitCount, isDirty } =
    useFormState({
      control,
    })

  const buttonState = useButtonState(isSubmitSuccessful, submitCount)
  const buttonClass = `${baseButtonClass} ${buttonStateClasses[buttonState]} ${className}`
  const label = buttonLabels[buttonState]
  const icon = icons[buttonState]

  return (
    <button
      className={buttonClass}
      type="submit"
      disabled={isSubmitting || !isDirty}
    >
      {icon && <Icon className={icon} ariaLabel="" />}
      {t(label)}
    </button>
  )
}

function useButtonState(
  isSubmitSuccessful: boolean,
  submissionAttempts: number,
) {
  const [state, setState] = useState<"success" | "error" | "idle">("idle")
  const timeoutRef = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (submissionAttempts === 0) {
      return
    }
    setState(isSubmitSuccessful ? "success" : "error")
    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = window.setTimeout(() => {
      setState("idle")
      timeoutRef.current = undefined
    }, SUCCESS_DURATION_MS)
  }, [submissionAttempts, isSubmitSuccessful])

  return state
}
