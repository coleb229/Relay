import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import { FEATURE_ICONS } from "../feature-icons";
import type { FeaturesGridSection as FeaturesGridSectionType } from "../schemas";

interface FeaturesGridSectionProps {
  config: FeaturesGridSectionType["config"];
}

export function FeaturesGridSection({ config }: FeaturesGridSectionProps) {
  const { heading, columnCount, columns } = config;

  const gridColsClass = cn(
    "grid grid-cols-1 gap-6 sm:grid-cols-2",
    columnCount === 2 && "lg:grid-cols-2",
    columnCount === 3 && "lg:grid-cols-3",
    columnCount === 4 && "lg:grid-cols-4"
  );

  return (
    <div className="mx-auto max-w-5xl px-6">
      {heading && (
        <h2 className="mb-8 text-2xl font-semibold tracking-tight">
          {heading}
        </h2>
      )}
      {columns.length > 0 && (
        <div className={gridColsClass}>
          {columns.map((col, i) => {
            const Icon = FEATURE_ICONS[col.icon] ?? BookOpen;
            const iconStyles = [
              { bg: "bg-primary/10", text: "text-primary" },
              { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
              { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
              { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
            ];
            const style = iconStyles[i % iconStyles.length];
            return (
              <div
                key={i}
                className="rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className={`mb-3 flex size-10 items-center justify-center rounded-lg ${style.bg} ${style.text}`}>
                  <Icon className="size-5" />
                </div>
                {col.heading && (
                  <h3 className="mb-1.5 text-base font-semibold">
                    {col.heading}
                  </h3>
                )}
                {col.text && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {col.text}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
