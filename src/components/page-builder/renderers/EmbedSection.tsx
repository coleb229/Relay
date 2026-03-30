"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { CodeXmlIcon, GlobeIcon, ShieldAlertIcon } from "lucide-react";
import type { EmbedSection as EmbedSectionType } from "../schemas";

interface EmbedSectionProps {
  config: EmbedSectionType["config"];
}

const HEIGHT_MAP = {
  sm: 200,
  md: 400,
  lg: 600,
  xl: 800,
  custom: 0,
} as const;

const ASPECT_RATIO_MAP = {
  auto: undefined,
  "16:9": "16 / 9",
  "4:3": "4 / 3",
  "1:1": "1 / 1",
} as const;

const BORDER_RADIUS_MAP = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
} as const;

/**
 * Sanitize HTML by stripping script tags and event handlers.
 * This is a basic sanitizer for admin-authored content — not a
 * full XSS prevention library, but catches the most common vectors.
 */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]*/gi, "")
    .replace(/javascript\s*:/gi, "");
}

export function EmbedSection({ config }: EmbedSectionProps) {
  const { mode, url, html, height, customHeight, aspectRatio, showBorder, borderRadius, caption } = config;

  const sanitizedHtml = useMemo(() => (mode === "html" ? sanitizeHtml(html) : ""), [mode, html]);

  const isEmpty = mode === "url" ? !url.trim() : !html.trim();

  if (isEmpty) {
    return (
      <div className="mx-auto max-w-4xl px-6">
        <div className={cn(
          "flex flex-col items-center justify-center gap-2 py-16",
          "rounded-lg border border-dashed border-border/60 bg-muted/30"
        )}>
          {mode === "url" ? (
            <GlobeIcon className="size-8 text-muted-foreground/50" />
          ) : (
            <CodeXmlIcon className="size-8 text-muted-foreground/50" />
          )}
          <p className="text-sm text-muted-foreground">
            {mode === "url" ? "Enter a URL to embed" : "Add HTML to embed"}
          </p>
        </div>
      </div>
    );
  }

  const resolvedHeight = height === "custom" ? customHeight : HEIGHT_MAP[height];
  const resolvedAspectRatio = ASPECT_RATIO_MAP[aspectRatio];

  const containerStyle: React.CSSProperties = {};
  if (resolvedAspectRatio) {
    containerStyle.aspectRatio = resolvedAspectRatio;
  } else {
    containerStyle.height = resolvedHeight;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 space-y-2">
      <div
        className={cn(
          "relative overflow-hidden",
          BORDER_RADIUS_MAP[borderRadius],
          showBorder && "border border-border/60"
        )}
        style={containerStyle}
      >
        {mode === "url" ? (
          <iframe
            src={url}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title="Embedded content"
          />
        ) : (
          <div className="relative h-full w-full">
            <div className="absolute inset-0 flex items-start gap-1.5 px-3 py-2 text-[10px] text-muted-foreground/70 pointer-events-none z-10">
              <ShieldAlertIcon className="size-3 shrink-0 mt-0.5" />
              <span>Custom HTML (admin only)</span>
            </div>
            <iframe
              srcDoc={sanitizedHtml}
              className="h-full w-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              title="Custom HTML embed"
              loading="lazy"
            />
          </div>
        )}
      </div>
      {caption && (
        <p className="text-xs text-muted-foreground text-center">{caption}</p>
      )}
    </div>
  );
}
