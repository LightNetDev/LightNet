import type { ButtonHTMLAttributes, ReactNode } from "react"

type Props = {
  variant: "secondary"
  children?: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({
  children,
  className,
  variant,
  ...buttonProps
}: Props) {
  const styles = {
    secondary: "text-slate-800 bg-slate-50 hover:bg-sky-50",
  } as const

  return (
    <button
      className={`flex items-center gap-1 rounded-xl px-8 py-4 text-sm font-bold shadow-sm transition-colors ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 ${styles[variant]} ${className}`}
      type="button"
      {...buttonProps}
    >
      {children}
    </button>
  )
}
