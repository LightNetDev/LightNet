import { type Control, type FieldError, useFormState } from "react-hook-form"

export function useFieldError({
  control,
  name,
  index,
}: {
  control: Control<any>
  name: string
  index?: number
}) {
  const { errors } = useFormState({ control, name, exact: true })
  const error = errors[name]
  if (!error) {
    return undefined
  }
  if (Array.isArray(error)) {
    return index !== undefined ? (error[index] as FieldError) : undefined
  }
  return error as FieldError
}
