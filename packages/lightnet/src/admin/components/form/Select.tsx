import type { Control, FieldValues, Path } from "react-hook-form"

import ErrorMessage from "./atoms/ErrorMessage"
import Hint from "./atoms/Hint"
import Label from "./atoms/Label"
import { useFieldError } from "./hooks/use-field-error"

export default function Select<TFieldValues extends FieldValues>({
  name,
  label,
  labelSize,
  control,
  defaultValue,
  hint,
  preserveHintSpace = true,
  options,
}: {
  name: Path<TFieldValues>
  label?: string
  labelSize?: "small" | "medium"
  hint?: string
  preserveHintSpace?: boolean
  defaultValue?: string
  control: Control<TFieldValues>
  options: { id: string; labelText?: string }[]
}) {
  const errorMessage = useFieldError({ control, name })
  return (
    <div key={name} className="group flex w-full flex-col">
      {label && (
        <label htmlFor={name}>
          <Label label={label} size={labelSize} />
        </label>
      )}
      <select
        {...control.register(name)}
        id={name}
        aria-invalid={!!errorMessage}
        defaultValue={defaultValue}
        className={`dy-select dy-select-bordered text-base shadow-sm focus:border-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700 ${errorMessage ? "dy-select-error" : ""} ${label ? "rounded-ss-none" : ""}`}
      >
        {options.map(({ id, labelText }) => (
          <option key={id} value={id}>
            {labelText ?? id}
          </option>
        ))}
      </select>
      <ErrorMessage message={errorMessage} />
      <Hint preserveSpace={preserveHintSpace} label={hint} />
    </div>
  )
}
