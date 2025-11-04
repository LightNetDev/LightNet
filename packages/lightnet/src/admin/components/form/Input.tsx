import type { FieldError, Path, UseFormRegister } from "react-hook-form"

import type { MediaItem } from "../../types/media-item"
import ErrorMessage from "./atoms/ErrorMessage"
import Hint from "./atoms/Hint"
import Label from "./atoms/Label"

export default function Input({
  name,
  label,
  register,
  error,
  hint,
  type = "text",
}: {
  name: Path<MediaItem>
  label: string
  hint?: string
  register: UseFormRegister<MediaItem>
  error?: FieldError
  type?: "text" | "date"
}) {
  return (
    <label className="dy-form-control w-full">
      <Label label={label} />
      <input
        className={`dy-input dy-input-bordered ${error ? "dy-input-error" : ""}`}
        type={type}
        {...register(name)}
      />
      <ErrorMessage error={error} />
      <Hint hint={hint} />
    </label>
  )
}
