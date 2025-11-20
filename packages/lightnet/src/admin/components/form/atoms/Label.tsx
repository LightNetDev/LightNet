import { useI18n } from "../../../../i18n/react/useI18n"

export default function Label({
  label,
  size = "medium",
  className = "",
}: {
  label: string
  className?: string
  size?: "small" | "medium"
}) {
  const { t } = useI18n()
  return (
    <div className="flex">
      <span
        className={`rounded-t-md bg-gray-300 px-4 font-bold text-gray-700 shadow-sm transition-colors duration-150 group-focus-within:bg-blue-700 group-focus-within:text-white group-focus-within:ring-1 group-focus-within:ring-blue-700 ${size === "medium" ? "py-2 text-sm" : "py-1 text-xs"} ${className}`}
      >
        {t(label)}
      </span>
    </div>
  )
}
