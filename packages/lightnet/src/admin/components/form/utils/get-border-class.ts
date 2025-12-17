const focusColors = (focusWithin: boolean | undefined) =>
  focusWithin
    ? "group-focus-within:border-sky-700 group-focus-within:ring-1 group-focus-within:ring-sky-700"
    : "focus:border-sky-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-700"

export const getBorderClass = ({
  isDirty,
  errorMessage,
  focusWithin,
}: {
  isDirty?: boolean
  focusWithin?: boolean
  errorMessage?: string
}) => {
  if (errorMessage) {
    return "border border-rose-800 " + focusColors(focusWithin)
  }
  if (isDirty) {
    return "border border-slate-700 " + focusColors(focusWithin)
  }
  return "border border-slate-300 " + focusColors(focusWithin)
}
