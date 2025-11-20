import { type Control,get, useFormState } from "react-hook-form"

export function useFieldDirty({
  control,
  name,
}: {
  control: Control<any>
  name: string
}) {
  const { dirtyFields } = useFormState({ control, name, exact: true })
  return get(dirtyFields, name) as boolean | undefined
}
