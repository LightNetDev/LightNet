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

  return (
    <div
      id={id}
      className={`dy-toast pointer-events-none opacity-0 transition-opacity duration-300 ${className}`}
      data-toast="true"
      data-variant={variant}
      role="status"
      aria-live={ariaLive}
    >
      <div className={`dy-alert ${alertClasses}`}>
        <span>{children}</span>
      </div>
    </div>
  )
}
