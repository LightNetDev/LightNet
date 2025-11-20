import { useI18n } from "../../../../i18n/react/useI18n"

export default function Label({
  label,
  for: htmlFor,
  size = "sm",
  className,
}: {
  label: string
  for: string
  className?: string
  size?: "sm" | "xs"
}) {
  const { t } = useI18n()
  return (
    <label
      htmlFor={htmlFor}
      className={`font-bold text-gray-600 ${size === "sm" ? "pb-2 text-sm" : "pb-1 text-xs"} ${className}`}
    >
      {t(label)}
    </label>
  )
}
