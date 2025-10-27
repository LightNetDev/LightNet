import { useStore } from "@tanstack/react-form"
import { useEffect, useRef, useState } from "react"

import Icon from "../../../components/Icon"
import { useFormContext } from "./form-context"

const SUCCESS_DURATION_MS = 2000

const baseButtonClass =
  "flex min-w-52 items-center justify-center gap-2 rounded-2xl px-6 py-3 font-bold uppercase shadow-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed"

const buttonStateClasses = {
  idle: "bg-gray-800 text-gray-100 hover:bg-gray-950 hover:text-gray-300 disabled:bg-gray-600 disabled:text-gray-200",
  error:
    "bg-rose-700 text-white hover:bg-rose-800 hover:text-white disabled:bg-rose-600",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white disabled:bg-emerald-500",
} as const

const buttonLabels = {
  idle: "Save",
  success: "Saved",
  error: "Failed",
} as const

const icons = {
  idle: undefined,
  success: "mdi--check",
  error: "mdi--error-outline",
} as const

export default function SubmitButton() {
  const form = useFormContext()
  const { submissionAttempts, isSubmitting, isSubmitSuccessful } = useStore(
    form.store,
    (state) => ({
      canSubmit: state.canSubmit,
      isSubmitting: state.isSubmitting,
      isSubmitSuccessful: state.isSubmitSuccessful,
      submissionAttempts: state.submissionAttempts,
    }),
  )
  const buttonState = useButtonState(isSubmitSuccessful, submissionAttempts)
  const buttonClass = `${baseButtonClass} ${buttonStateClasses[buttonState]}`
  const label = buttonLabels[buttonState]
  const icon = icons[buttonState]

  return (
    <button className={buttonClass} type="submit" disabled={isSubmitting}>
      {icon && <Icon className={icon} ariaLabel="" />}
      {label}
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
