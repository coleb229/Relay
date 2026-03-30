"use client";

import { cn } from "@/lib/utils";
import type { StatsBarSection as StatsBarSectionType } from "../schemas";

interface StatsBarSectionProps {
  config: StatsBarSectionType["config"];
}

export function StatsBarSection({ config }: StatsBarSectionProps) {
  const { heading, columnCount, columns } = config;

  if (!columns || columns.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6">
        <p className="text-center text-sm text-muted-foreground">
          Add stats to display
        </p>
      </div>
    );
  }

  const gridColsClass = cn(
    "grid grid-cols-1 gap-6 sm:grid-cols-2",
    columnCount === 2 && "lg:grid-cols-2",
    columnCount === 3 && "lg:grid-cols-3",
    columnCount === 4 && "lg:grid-cols-4"
  );

  return (
    <div className="mx-auto max-w-4xl px-6">
      {heading && (
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">
          {heading}
        </h2>
      )}
      <div className={gridColsClass}>
        {columns.map((stat, i) => (
          <div key={i} className="text-center">
            <p className="text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
              {stat.prefix}
              {stat.value}
              {stat.suffix}
            </p>
            {stat.label && (
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
