import { type Control, type FieldValues, type Path } from "react-hook-form"

import Icon from "../../../components/Icon"
import ErrorMessage from "./atoms/ErrorMessage"
import Hint from "./atoms/Hint"
import Label from "./atoms/Label"
import { useFieldDirty } from "./hooks/use-field-dirty"
import { useFieldError } from "./hooks/use-field-error"
import { getBorderClass } from "./utils/get-border-class"

export default function Select<TFieldValues extends FieldValues>({
  name,
  label,
  labelSize,
  required = false,
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
  required?: boolean
  preserveHintSpace?: boolean
  defaultValue?: string
  control: Control<TFieldValues>
  options: { id: string; labelText?: string }[]
}) {
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
            required={required}
            isInvalid={!!errorMessage}
          />
        </label>
      )}
      <div className="relative">
        <select
          {...control.register(name)}
          id={name}
          aria-invalid={!!errorMessage}
          aria-required={required}
          required={required}
          defaultValue={defaultValue}
          className={`w-full appearance-none rounded-lg ${getBorderClass({ isDirty, errorMessage })} bg-white px-4 py-3 pe-12 shadow-sm ${label ? "rounded-ss-none" : ""}`}
        >
          {options.map(({ id, labelText }) => (
            <option key={id} value={id}>
              {labelText ?? id}
            </option>
          ))}
        </select>
        <Icon
          className="absolute end-3 top-1/2 -translate-y-1/2 text-lg text-slate-600 mdi--chevron-down"
          ariaLabel=""
        />
      </div>
      <ErrorMessage message={errorMessage} />
      <Hint preserveSpace={preserveHintSpace} label={hint} />
    </div>
  )
}
