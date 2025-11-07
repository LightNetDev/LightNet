import type { FieldError, Path, UseFormRegister } from "react-hook-form"

import { useI18n } from "../../../i18n/react/useI18n"
import type { MediaItem } from "../../types/media-item"
import ErrorMessage from "./atoms/ErrorMessage"
import Hint from "./atoms/Hint"
import Label from "./atoms/Label"

export default function Select({
  name,
  label,
  register,
  error,
  hint,
  options,
}: {
  name: Path<MediaItem>
  label: string
  hint?: string
  register: UseFormRegister<MediaItem>
  options: { id: string; label?: string }[]
  error?: FieldError
}) {
  const { t } = useI18n()
  return (
    <label className="dy-form-control w-full">
      <Label label={label} />
      <select
        {...register(name)}
        className={`dy-select dy-select-bordered ${error ? "dy-select-error" : ""}"`}
      >
        {options.map(({ id, label }) => (
          <option key={id} value={id}>
            {label ? t(label) : id}
          </option>
        ))}
      </select>
      <ErrorMessage message={error?.message} />
      <Hint hint={hint} />
    </label>
  )
}
