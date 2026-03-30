"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getIcon } from "../icon-registry";
import type { MultiColumnSection as MultiColumnSectionType } from "../schemas";

interface MultiColumnSectionProps {
  config: MultiColumnSectionType["config"];
}

const GAP_MAP = {
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
} as const;

const VERTICAL_ALIGN_MAP = {
  top: "items-start",
  center: "items-center",
  bottom: "items-end",
} as const;

const ICON_STYLES = [
  { bg: "bg-primary/10", text: "text-primary" },
  { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
];

export function MultiColumnSection({ config }: MultiColumnSectionProps) {
  const { heading, subheading, columnCount, gap, verticalAlign, equalHeight, columns } = config;

  if (columns.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6">
        <p className="py-12 text-center text-sm text-muted-foreground">
          Add columns to display
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6">
      {(heading || subheading) && (
        <div className="mb-8">
          {heading && (
            <h2 className="text-2xl font-semibold tracking-tight">{heading}</h2>
          )}
          {subheading && (
            <p className="mt-2 text-muted-foreground">{subheading}</p>
          )}
        </div>
      )}

      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2",
          columnCount === 2 && "lg:grid-cols-2",
          columnCount === 3 && "lg:grid-cols-3",
          columnCount === 4 && "lg:grid-cols-4",
          GAP_MAP[gap],
          VERTICAL_ALIGN_MAP[verticalAlign]
        )}
      >
        {columns.map((col, i) => {
          const iconStyle = ICON_STYLES[i % ICON_STYLES.length];
          const Icon = col.icon ? getIcon(col.icon) : null;

          return (
            <div
              key={i}
              className={cn("flex flex-col", equalHeight && "h-full")}
            >
              {col.imageUrl && (
                <img
                  src={col.imageUrl}
                  alt={col.heading || ""}
                  className="mb-4 w-full rounded-lg object-cover aspect-video"
                />
              )}

              {Icon && (
                <div
                  className={cn(
                    "mb-3 flex size-10 items-center justify-center rounded-lg",
                    iconStyle.bg,
                    iconStyle.text
                  )}
                >
                  <Icon className="size-5" />
                </div>
              )}

              {col.heading && (
                <h3 className="mb-1.5 text-lg font-semibold">{col.heading}</h3>
              )}

              {col.text && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {col.text}
                </p>
              )}

              {col.buttonText && (
                <Button
                  variant="link"
                  size="sm"
                  render={<a href={col.buttonLink || "#"} />}
                  className="mt-3 h-auto p-0"
                >
                  {col.buttonText}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
