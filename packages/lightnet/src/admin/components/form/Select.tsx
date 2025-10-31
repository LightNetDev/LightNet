import { useI18n } from "../../../i18n/react/useI18n"
import { FieldErrors } from "./atoms/FieldErrors"
import Hint from "./atoms/Hint"
import Label from "./atoms/Label"
import { useFieldContext } from "./form-context"

export default function Select({
  label,
  hint,
  options,
}: {
  label: string
  hint?: string
  options: { id: string; label?: string }[]
}) {
  const field = useFieldContext<string>()
  const { t } = useI18n()
  return (
    <label className="dy-form-control">
      <Label label={label} />
      <select
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        className={`dy-select dy-select-bordered ${field.state.meta.errors.length ? "dy-select-error" : ""}"`}
      >
        {options.map(({ id, label }) => (
          <option key={id} value={id}>
            {label ? t(label) : id}
          </option>
        ))}
      </select>
      <FieldErrors meta={field.state.meta} />
      <Hint hint={hint} />
    </label>
  )
}
