import { type Control, type FieldValues, type Path } from "react-hook-form"

import ErrorMessage from "./atoms/ErrorMessage"
import Hint from "./atoms/Hint"
import Label from "./atoms/Label"
import { useFieldError } from "./hooks/use-field-error"
import type { InputHTMLAttributes } from "react"

type Props<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>
  label?: string
  labelSize?: "small" | "medium"
  hint?: string
  preserveHintSpace?: boolean
  control: Control<TFieldValues>
} & InputHTMLAttributes<HTMLInputElement>

export default function Input<TFieldValues extends FieldValues>({
  name,
  label,
  labelSize,
  hint,
  preserveHintSpace = true,
  control,
  ...inputProps
}: Props<TFieldValues>) {
  const errorMessage = useFieldError({ control, name })
  return (
    <div key={name} className="group flex w-full flex-col">
      {label && (
        <label htmlFor="name">
          <Label label={label} size={labelSize} />
        </label>
      )}

      <input
        className={`dy-input dy-input-bordered border-gray-300 shadow-inner focus:border-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700 ${errorMessage ? "dy-input-error" : ""} ${label ? "rounded-ss-none" : ""}`}
        id={name}
        aria-invalid={!!errorMessage}
        {...control.register(name)}
        {...inputProps}
      />
      <ErrorMessage message={errorMessage} />
      <Hint preserveSpace={preserveHintSpace} label={hint} />
    </div>
  )
}
