import { FieldErrors } from "./FieldErrors"
import { useFieldContext } from "./form-context"

export default function TextField({
  label,
  hint,
  type = "text",
}: {
  label: string
  hint?: string
  type?: "text" | "date"
}) {
  const field = useFieldContext<string>()
  return (
    <>
      <label className="dy-form-control w-full">
        <div className="dy-label">
          <span className="text-sm font-bold uppercase text-gray-500">
            {label}
          </span>
        </div>
        <input
          id={field.name}
          name={field.name}
          type={type}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          className={`dy-input dy-input-bordered ${field.state.meta.errors.length ? "dy-input-error" : ""}`}
        />
        <FieldErrors meta={field.state.meta} />

        <div className="flex h-8 w-full items-center justify-end">
          {hint && <span className="dy-label-text-alt">{hint}</span>}
        </div>
      </label>
    </>
  )
}
