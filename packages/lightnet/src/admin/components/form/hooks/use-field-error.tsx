import { type Control, get, useFormState } from "react-hook-form"

export function useFieldError({
  control,
  name,
  exact = true,
}: {
  control: Control<any>
  name: string
  exact?: boolean
}) {
  const { errors } = useFormState({ control, name, exact })
  return findErrorMessage(get(errors, name))
}

function findErrorMessage(errors?: unknown) {
  if (!errors) {
    return undefined
  }
  for (const [key, value] of Object.entries(errors)) {
    if (key === "message" && typeof value === "string") {
      return value
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return findErrorMessage(value)
    }
  }
  return undefined
}
