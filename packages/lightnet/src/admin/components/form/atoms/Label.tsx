import { useI18n } from "../../../../i18n/react/useI18n"

export default function Label({
  label,
  size = "medium",
  className = "",
  isDirty,
  isInvalid,
}: {
  label: string
  className?: string
  size?: "small" | "medium"
  isDirty?: boolean
  isInvalid?: boolean
}) {
  const { t } = useI18n()
  return (
    <div className="flex">
      <span
        className={`rounded-t-md bg-gray-300 px-4 font-bold text-gray-700 shadow-sm transition-colors duration-150 group-focus-within:bg-sky-700 group-focus-within:text-gray-50 group-focus-within:ring-1 group-focus-within:ring-sky-700 ${size === "medium" ? "py-2 text-sm" : "py-1 text-xs"} ${isDirty ? "bg-gray-700 !text-white" : ""} ${isInvalid ? "bg-rose-800 !text-gray-50" : ""} ${className}`}
      >
        {t(label)}
      </span>
    </div>
  )
}
