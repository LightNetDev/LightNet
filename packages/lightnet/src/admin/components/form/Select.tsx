import type { Control, FieldValues, Path } from "react-hook-form"

import { useI18n } from "../../../i18n/react/useI18n"
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
  options: { id: string; label?: string }[]
}) {
  const { t } = useI18n()
  const hasError = !!useFieldError({ control, name })
  return (
    <label key={name} className="dy-form-control w-full">
      <Label label={label} />
      <select
        {...control.register(name)}
        aria-invalid={hasError}
        className={`dy-select dy-select-bordered ${hasError ? "dy-select-error" : ""}"`}
      >
        {options.map(({ id, label }) => (
          <option key={id} value={id}>
            {label ? t(label) : id}
          </option>
        ))}
      </select>
      <ErrorMessage name={name} control={control} />
      <Hint hint={hint} />
    </label>
  )
}
