import * as React from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  children?: React.ReactNode
  variant?: "default" | "centered" | "inline"
  className?: string
}

/**
 * Empty state with layout variants to break centered-everything monotony.
 *
 * - `default` — left-aligned with icon beside text (primary variant for pages)
 * - `centered` — centered layout (appropriate for confirmations, modals, small containers)
 * - `inline` — compact, for table rows or inline contexts
 */
function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  variant = "default",
  className,
}: EmptyStateProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-3 py-6 px-4 text-muted-foreground", className)}>
        {Icon && <Icon className="size-5 shrink-0" />}
        <div className="text-sm">
          <span className="font-medium text-foreground">{title}</span>
          {description && <span className="text-muted-foreground"> — {description}</span>}
        </div>
        {children && <div className="ml-auto shrink-0">{children}</div>}
      </div>
    )
  }

  if (variant === "centered") {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
        {Icon && (
          <div className="flex size-14 items-center justify-center rounded-full bg-muted mb-4">
            <Icon className="size-6 text-muted-foreground" />
          </div>
        )}
        <h3 className="text-base font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
        )}
        {children && <div className="mt-4">{children}</div>}
      </div>
    )
  }

  // Default: left-aligned with icon
  return (
    <div className={cn("flex items-start gap-4 rounded-xl border border-dashed border-border p-6", className)}>
      {Icon && (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  )
}

export { EmptyState }
