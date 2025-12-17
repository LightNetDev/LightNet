import { useI18n } from "../../../../i18n/react/use-i18n"

export default function Label({
  label,
  size = "medium",
  className = "",
  isDirty,
  isInvalid,
  required,
}: {
  label: string
  className?: string
  size?: "small" | "medium"
  isDirty?: boolean
  isInvalid?: boolean
  required: boolean
}) {
  const { t } = useI18n()

  const getColor = () => {
    if (isInvalid) {
      return "bg-rose-800 text-white"
    }
    if (isDirty) {
      return "bg-slate-800 text-white"
    }
    return "bg-slate-300 text-slate-800"
  }
  return (
    <div
      className={`inline-flex rounded-t-md px-4 font-bold ${getColor()} transition-colors duration-150 group-focus-within:!bg-sky-700 group-focus-within:text-slate-50 group-focus-within:ring-1 group-focus-within:ring-sky-700 ${size === "medium" ? "py-2 text-sm" : "py-1 text-xs"} ${className}`}
    >
      {t(label)}
      {!required && <span className="ms-1">({t("ln.admin.optional")})</span>}
    </div>
  )
}
