import { useI18n } from "../../../../i18n/react/useI18n"

export default function Legend({
  label,
  size = "sm",
  className,
}: {
  label: string
  className?: string
  size?: "sm" | "xs"
}) {
  const { t } = useI18n()
  return (
    <legend
      className={`pb-2 font-bold uppercase text-gray-500 ${size === "sm" ? "text-sm" : "text-xs"} ${className}`}
    >
      {t(label)}
    </legend>
  )
}
