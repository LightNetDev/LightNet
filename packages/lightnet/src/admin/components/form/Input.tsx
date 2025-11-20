import { type Control, type FieldValues, type Path } from "react-hook-form"

import ErrorMessage from "./atoms/ErrorMessage"
import Hint from "./atoms/Hint"
import Label from "./atoms/Label"
import { useFieldError } from "./hooks/use-field-error"

type Props<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>
  label?: string
  defaultValue?: string
  hint?: string
  preserveHintSpace?: boolean
  control: Control<TFieldValues>
  type?: "text" | "date"
}

export default function Input<TFieldValues extends FieldValues>({
  name,
  label,
  defaultValue,
  hint,
  preserveHintSpace = true,
  control,
  type = "text",
}: Props<TFieldValues>) {
  const errorMessage = useFieldError({ control, name })
  return (
    <div key={name} className="group flex w-full flex-col">
      {label && (
        <label htmlFor="name">
          <Label label={label} />
        </label>
      )}

      <input
        className={`dy-input dy-input-bordered border-gray-300 shadow-inner focus:border-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700 ${errorMessage ? "dy-input-error" : ""} ${label ? "rounded-ss-none" : ""}`}
        type={type}
        id={name}
        defaultValue={defaultValue}
        aria-invalid={!!errorMessage}
        {...control.register(name)}
      />
      <ErrorMessage message={errorMessage} />
      <Hint preserveSpace={preserveHintSpace} label={hint} />
    </div>
  )
}
