import { useI18n } from "../../../../i18n/react/useI18n"

export default function Hint({ hint }: { hint?: string }) {
  const { t } = useI18n()
  return (
    <div className="flex h-8 w-full items-center justify-end">
      {hint && <span className="dy-label-text-alt">{t(hint)}</span>}
    </div>
  )
}
