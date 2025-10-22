import type { AnyFieldMeta } from "@tanstack/react-form"

type FieldErrorsProps = {
  meta: AnyFieldMeta
}

export const FieldErrors = ({ meta }: FieldErrorsProps) => {
  if (!meta.isTouched || meta.isValid) return null

  return (
    <ul role="alert">
      {meta.errors.map((error) => (
        <li className="text-sm text-red-900" key={error}>
          {error}
        </li>
      ))}
    </ul>
  )
}
