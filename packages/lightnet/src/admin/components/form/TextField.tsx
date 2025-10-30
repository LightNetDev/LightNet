import { FieldErrors } from "./FieldErrors"
import { useFieldContext } from "./form-context"

export default function TextField({
  label,
  hint,
}: {
  label: string
  hint?: string
}) {
  const field = useFieldContext<string>()
  return (
    <>
      <label className="dy-form-control w-full">
        <div className="dy-label">
          <span className="dy-label-text">{label}</span>
        </div>
        <input
          id={field.name}
          name={field.name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          className={`dy-input dy-input-bordered ${field.state.meta.errors.length ? "dy-input-error" : ""}`}
        />
        {hint && (
          <div className="dy-label">
            <span className="dy-label-text-alt">{hint}</span>
          </div>
        )}
        <FieldErrors meta={field.state.meta} />
      </label>
    </>
  )
}
