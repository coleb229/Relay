"use client";

import { cn } from "@/lib/utils";
import type { TableSection as TableSectionType } from "../schemas";

interface TableSectionProps {
  config: TableSectionType["config"];
}

const ALIGN_MAP = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

export function TableSection({ config }: TableSectionProps) {
  const { heading, columns, rows, showHeader, striped, bordered, hoverable, compact, caption } =
    config;

  if (columns.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6">
        <p className="text-center text-sm text-muted-foreground">
          Add columns to build your table
        </p>
      </div>
    );
  }

  const cellPadding = compact ? "px-3 py-2" : "px-4 py-3";

  return (
    <div className="mx-auto max-w-5xl px-6 space-y-4">
      {heading && (
        <h2 className="text-2xl font-semibold tracking-tight">{heading}</h2>
      )}

      <div className="overflow-x-auto rounded-lg">
        <table
          className={cn(
            "w-full tabular-nums text-sm",
            bordered && "border border-border/60"
          )}
        >
          {showHeader && (
            <thead>
              <tr
                className={cn(
                  "border-b border-border/60 bg-muted/40",
                  bordered && "divide-x divide-border/60"
                )}
              >
                {columns.map((col, colIdx) => (
                  <th
                    key={`header-${colIdx}`}
                    className={cn(
                      cellPadding,
                      "font-medium text-muted-foreground uppercase text-xs tracking-wider",
                      ALIGN_MAP[col.align]
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
          )}

          <tbody
            className={cn(bordered && "divide-y divide-border/60")}
          >
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  No data rows yet
                </td>
              </tr>
            ) : (
              rows.map((row, rowIdx) => (
                <tr
                  key={`row-${rowIdx}`}
                  className={cn(
                    !bordered && "border-b border-border/40",
                    striped && rowIdx % 2 === 1 && "bg-muted/30",
                    hoverable &&
                      "transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-muted/40",
                    bordered && "divide-x divide-border/60"
                  )}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={`cell-${rowIdx}-${colIdx}`}
                      className={cn(cellPadding, ALIGN_MAP[col.align])}
                    >
                      {row[colIdx] ?? ""}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {caption && (
        <p className="text-xs text-muted-foreground">{caption}</p>
      )}
    </div>
  );
}
