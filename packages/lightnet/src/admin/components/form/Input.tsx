import { type Control, type FieldValues, type Path } from "react-hook-form"

import ErrorMessage from "./atoms/ErrorMessage"
import Hint from "./atoms/Hint"
import Label from "./atoms/Label"
import { useFieldError } from "./hooks/use-field-error"

export default function Input<TFieldValues extends FieldValues>({
  name,
  label,
  hint,
  control,
  type = "text",
}: {
  name: Path<TFieldValues>
  label: string
  hint?: string
  control: Control<TFieldValues>
  type?: "text" | "date"
}) {
  const hasError = !!useFieldError({ control, name })
  return (
    <div key={name} className="flex w-full flex-col">
      <Label for={name} label={label} />
      <input
        className={`dy-input dy-input-bordered ${hasError ? "dy-input-error" : ""}`}
        type={type}
        id={name}
        aria-invalid={hasError}
        {...control.register(name)}
      />
      <ErrorMessage name={name} control={control} />
      <Hint hint={hint} />
    </div>
  )
}
