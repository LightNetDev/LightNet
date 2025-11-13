import { type Control, get, useFormState } from "react-hook-form"

export function useFieldError({
  control,
  name,
}: {
  control: Control<any>
  name: string
}) {
  const { errors } = useFormState({ control, name, exact: true })
  const error = get(errors, name) as { message: string } | undefined
  return error?.message
}
