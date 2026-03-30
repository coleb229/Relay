"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Info, CheckCircle2, AlertTriangle, Megaphone, XIcon } from "lucide-react";
import type { BannerSection as BannerSectionType } from "../schemas";

interface BannerSectionProps {
  config: BannerSectionType["config"];
}

const VARIANT_STYLES = {
  info: {
    wrapper: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200",
    icon: "text-blue-600 dark:text-blue-400",
    cta: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400",
    dismiss: "text-blue-600/60 hover:text-blue-800 dark:text-blue-400/60 dark:hover:text-blue-200",
    Icon: Info,
  },
  success: {
    wrapper: "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200",
    icon: "text-emerald-600 dark:text-emerald-400",
    cta: "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400",
    dismiss: "text-emerald-600/60 hover:text-emerald-800 dark:text-emerald-400/60 dark:hover:text-emerald-200",
    Icon: CheckCircle2,
  },
  warning: {
    wrapper: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200",
    icon: "text-amber-600 dark:text-amber-400",
    cta: "bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400",
    dismiss: "text-amber-600/60 hover:text-amber-800 dark:text-amber-400/60 dark:hover:text-amber-200",
    Icon: AlertTriangle,
  },
  announcement: {
    wrapper: "bg-violet-50 border-violet-200 text-violet-900 dark:bg-violet-950/40 dark:border-violet-800 dark:text-violet-200",
    icon: "text-violet-600 dark:text-violet-400",
    cta: "bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400",
    dismiss: "text-violet-600/60 hover:text-violet-800 dark:text-violet-400/60 dark:hover:text-violet-200",
    Icon: Megaphone,
  },
} as const;

export function BannerSection({ config }: BannerSectionProps) {
  const [dismissed, setDismissed] = useState(false);
  const { message, variant, icon, ctaText, ctaLink, dismissible, sticky } = config;

  if (dismissed) return null;

  if (!message) {
    return (
      <div className="mx-auto max-w-4xl px-6">
        <p className="text-center text-sm text-muted-foreground">
          Enter a banner message to display
        </p>
      </div>
    );
  }

  const styles = VARIANT_STYLES[variant];
  const VariantIcon = styles.Icon;

  return (
    <div
      className={cn(
        "mx-auto max-w-5xl rounded-lg border px-4 py-3",
        sticky && "sticky top-0 z-40",
        styles.wrapper
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <VariantIcon className={cn("size-5 shrink-0", styles.icon)} />
        )}

        <p className="flex-1 text-sm font-medium">{message}</p>

        {ctaText && ctaLink && (
          <Button
            size="xs"
            render={
              <a
                href={ctaLink}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            className={cn("shrink-0 font-semibold", styles.cta)}
          >
            {ctaText}
          </Button>
        )}

        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className={cn(
              "shrink-0 rounded-md p-1 transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)",
              styles.dismiss
            )}
            aria-label="Dismiss banner"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
