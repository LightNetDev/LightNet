import type { ReactNode } from "react"

export type ToastVariant = "info" | "success" | "warning" | "error"

export type ToastProps = {
  id?: string
  children: ReactNode
  className?: string
  variant?: ToastVariant
}

const variantClassName: Record<ToastVariant, string> = {
  info: "border-slate-200 bg-white/95 text-slate-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
}

export default function Toast({
  id,
  children,
  className = "",
  variant = "info",
}: ToastProps) {
  const alertClasses = variantClassName[variant] ?? variantClassName.info
  const ariaLive = variant === "error" ? "assertive" : "polite"
  const hiddenTransform = "translateY(1.5rem)"
  const overshootTransform = "translateY(-0.25rem)"
  const visibleTransform = "translateY(0)"
  const innerBaseClass =
    "pointer-events-auto flex items-center gap-3 rounded-md border px-4 py-3 text-sm shadow-md backdrop-blur-sm"

  return (
    <div
      id={id}
      className={`dy-toast pointer-events-none opacity-0 transition duration-300 will-change-transform ${className}`}
      data-toast="true"
      data-variant={variant}
      data-toast-hidden-transform={hiddenTransform}
      data-toast-overshoot-transform={overshootTransform}
      data-toast-visible-transform={visibleTransform}
      role="status"
      aria-live={ariaLive}
      style={{
        transform: hiddenTransform,
        transitionProperty: "opacity, transform",
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div className={`${innerBaseClass} ${alertClasses}`}>
        <span>{children}</span>
      </div>
    </div>
  )
}
