import Icon from "../../../components/Icon"
import { useStore } from "@tanstack/react-form"
import { useEffect, useRef, useState } from "react"

import { useFormContext } from "./form-context"

type SubmitButtonProps = {
  label: string
  successLabel?: string
}

const SUCCESS_DURATION_MS = 2000

const baseButtonClass =
  "flex min-w-52 items-center justify-center gap-2 rounded-2xl px-6 py-3 font-bold uppercase shadow-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed"
const idleButtonClass =
  "bg-gray-800 text-gray-100 hover:bg-gray-950 hover:text-gray-300 disabled:bg-gray-600 disabled:text-gray-200"
const successButtonClass =
  "bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white disabled:bg-emerald-500"

export default function SubmitButton({
  label,
  successLabel = "Saved",
}: SubmitButtonProps) {
  const form = useFormContext()
  const { canSubmit, isSubmitting, isSubmitSuccessful } = useStore(
    form.store,
    (state) => ({
      canSubmit: state.canSubmit,
      isSubmitting: state.isSubmitting,
      isSubmitSuccessful: state.isSubmitSuccessful,
    }),
  )
  const visibleSuccess = useSuccessIndicator(isSubmitSuccessful)
  const displaySuccess = visibleSuccess && !isSubmitting
  const buttonClass = `${baseButtonClass} ${
    displaySuccess ? successButtonClass : idleButtonClass
  }`
  const text = displaySuccess ? successLabel : label

  return (
    <button
      className={buttonClass}
      type="submit"
      disabled={!canSubmit || isSubmitting}
    >
      {displaySuccess && <Icon className="mdi--check" ariaLabel="" />}
      {text}
    </button>
  )
}

function useSuccessIndicator(isSubmitSuccessful: boolean) {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!isSubmitSuccessful) {
      return
    }
    setVisible(true)
    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = window.setTimeout(() => {
      setVisible(false)
      timeoutRef.current = undefined
    }, SUCCESS_DURATION_MS)
  }, [isSubmitSuccessful])

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return visible
}
