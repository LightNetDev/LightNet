import type { AnyFieldMeta } from "@tanstack/react-form"

type FieldErrorsProps = {
  meta: AnyFieldMeta
}

export const FieldErrors = ({ meta }: FieldErrorsProps) => {
  if (!meta.isTouched || meta.isValid) return null

  return (
    <ul className="my-2 flex flex-col gap-1" role="alert">
      {meta.errors.map((error) => (
        <li className="text-sm text-rose-800" key={error.code}>
          {error.message}
        </li>
      ))}
    </ul>
  )
}
