import type { ReactNode } from "react"

export type ToastVariant = "info" | "success" | "warning" | "error"

export type ToastProps = {
  id?: string
  children: ReactNode
  className?: string
  variant?: ToastVariant
}

const variantClassName: Record<ToastVariant, string> = {
  info: "dy-alert-info",
  success: "dy-alert-success",
  warning: "dy-alert-warning",
  error: "dy-alert-error",
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
      className={`dy-toast pointer-events-none opacity-0 transition-all duration-300 will-change-transform ${className}`}
      data-toast="true"
      data-variant={variant}
      data-toast-hidden-transform={hiddenTransform}
      data-toast-overshoot-transform={overshootTransform}
      data-toast-visible-transform={visibleTransform}
      role="status"
      aria-live={ariaLive}
      style={{
        transform: hiddenTransform,
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div className={`dy-alert ${alertClasses}`}>
        <span>{children}</span>
      </div>
    </div>
  )
}
