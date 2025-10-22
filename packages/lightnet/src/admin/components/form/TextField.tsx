import { FieldErrors } from "./FieldErrors"
import { useFieldContext } from "./form-context"

export default function TextField({ label }: { label: string }) {
  const field = useFieldContext<string>()
  return (
    <>
      <label className="dy-form-control w-full max-w-xs">
        <div className="dy-label">
          <span className="dy-label-text">{label}</span>
        </div>
        <input
          id={field.name}
          name={field.name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          className="dy-input dy-input-bordered dy-input-sm w-full max-w-xs"
        />
        <FieldErrors meta={field.state.meta} />
      </label>
    </>
  )
}
