import type { Control, FieldValues, Path } from "react-hook-form"

import ErrorMessage from "./atoms/ErrorMessage"
import Hint from "./atoms/Hint"
import Label from "./atoms/Label"
import { useFieldError } from "./hooks/use-field-error"

export default function Select<TFieldValues extends FieldValues>({
  name,
  label,
  control,
  hint,
  options,
}: {
  name: Path<TFieldValues>
  label: string
  hint?: string
  control: Control<TFieldValues>
  options: { id: string; labelText?: string }[]
}) {
  const errorMessage = useFieldError({ control, name })
  return (
    <div key={name} className="flex w-full flex-col">
      <Label for={name} label={label} />
      <select
        {...control.register(name)}
        id={name}
        aria-invalid={!!errorMessage}
        className={`dy-select dy-select-bordered bg-gray-100 text-base shadow-sm ${errorMessage ? "dy-select-error" : ""}`}
      >
        {options.map(({ id, labelText }) => (
          <option key={id} value={id}>
            {labelText ?? id}
          </option>
        ))}
      </select>
      <ErrorMessage message={errorMessage} />
      <Hint label={hint} />
    </div>
  )
}
