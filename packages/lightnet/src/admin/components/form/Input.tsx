import type { InputHTMLAttributes } from "react"
import {
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form"

import ErrorMessage from "./atoms/ErrorMessage"
import Hint from "./atoms/Hint"
import Label from "./atoms/Label"
import { useFieldDirty } from "./hooks/use-field-dirty"
import { useFieldError } from "./hooks/use-field-error"
import { getBorderClass } from "./utils/get-border-class"

type Props<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>
  required?: boolean
  label?: string
  labelSize?: "small" | "medium"
  hint?: string
  preserveHintSpace?: boolean
  control: Control<TFieldValues>
  registerOptions?: RegisterOptions<TFieldValues>
} & InputHTMLAttributes<HTMLInputElement>

export default function Input<TFieldValues extends FieldValues>({
  name,
  label,
  labelSize,
  hint,
  preserveHintSpace = true,
  control,
  className,
  required = false,
  registerOptions,
  ...inputProps
}: Props<TFieldValues>) {
  const isDirty = useFieldDirty({ control, name })
  const errorMessage = useFieldError({ control, name })

  return (
    <div key={name} className="group flex w-full flex-col">
      {label && (
        <label htmlFor={name}>
          <Label
            label={label}
            size={labelSize}
            isDirty={isDirty}
            isInvalid={!!errorMessage}
            required={required}
          />
        </label>
      )}

      <input
        className={`rounded-xl ${getBorderClass({ isDirty, errorMessage })} px-4 py-3 shadow-inner disabled:text-slate-500 ${label ? "rounded-ss-none" : ""} ${className}`}
        id={name}
        aria-invalid={!!errorMessage}
        aria-required={required}
        {...control.register(name, registerOptions)}
        {...inputProps}
      />
      <ErrorMessage message={errorMessage} />
      <Hint preserveSpace={preserveHintSpace} label={hint} />
    </div>
  )
}
