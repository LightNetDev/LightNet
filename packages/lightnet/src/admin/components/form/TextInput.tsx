import { FieldErrors } from "./atoms/FieldErrors"
import Hint from "./atoms/Hint"
import Label from "./atoms/Label"
import { useFieldContext } from "./form-context"

export default function TextInput({
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
        <Label label={label} />
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
        <Hint hint={hint} />
      </label>
    </>
  )
}
