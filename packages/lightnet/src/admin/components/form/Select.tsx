import type { Control, FieldValues, Path } from "react-hook-form"

import ErrorMessage from "./atoms/ErrorMessage"
import Hint from "./atoms/Hint"
import Label from "./atoms/Label"
import { useFieldError } from "./hooks/use-field-error"

export default function Select<TFieldValues extends FieldValues>({
  name,
  label,
  control,
  defaultValue,
  hint,
  options,
}: {
  name: Path<TFieldValues>
  label: string
  hint?: string
  defaultValue?: string
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
        defaultValue={defaultValue}
        className={`dy-select dy-select-bordered text-base shadow-sm ${errorMessage ? "dy-select-error" : ""}`}
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
