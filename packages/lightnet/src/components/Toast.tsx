import type { ReactNode } from "react"

export type ToastVariant = "info" | "success" | "warning" | "error"

export type ToastProps = {
  id?: string
  children: ReactNode
  className?: string
  variant?: ToastVariant
}

const variantClassName: Record<ToastVariant, string> = {
  info: "border-slate-400 bg-white/95",
  success: "border-emerald-500 bg-emerald-100",
  warning: "border-amber-500 bg-amber-100",
  error: "border-rose-500 bg-rose-100",
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

  return (
    <div
      id={id}
      className={`pointer-events-none fixed bottom-4 end-0 flex justify-end px-4 opacity-0 transition duration-300 will-change-transform ${className}`}
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
      <div
        className={`pointer-events-auto flex max-w-sm flex-col items-start gap-1 rounded-2xl border p-4 text-base shadow-md backdrop-blur-sm ${alertClasses}`}
      >
        {children}
      </div>
    </div>
  )
}
