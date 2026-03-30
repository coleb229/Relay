import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface StatMetricProps {
  label: string
  value: React.ReactNode
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  href?: string
  className?: string
}

/**
 * A clean metric display — icon, value, label.
 * No card wrapper, no shadows, no gradients. Intentional and data-forward.
 */
function StatMetric({
  label,
  value,
  description,
  icon: Icon,
  href,
  className,
}: StatMetricProps) {
  const content = (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)",
        href && "hover:border-accent/40 hover:bg-accent/[0.03]",
        className
      )}
    >
      {Icon && (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-4 text-primary" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold tracking-tight tabular-nums mt-0.5">
          {value}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

/**
 * Auto-fit grid container for StatMetric items.
 * Responsive without hardcoded breakpoints.
 */
function MetricGrid({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        "grid-cols-[repeat(auto-fit,minmax(200px,1fr))]",
        className
      )}
    >
      {children}
    </div>
  )
}

export { StatMetric, MetricGrid }
