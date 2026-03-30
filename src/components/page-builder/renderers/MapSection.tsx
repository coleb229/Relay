"use client";

import { cn } from "@/lib/utils";
import type { MapSection as MapSectionType } from "../schemas";

interface MapSectionProps {
  config: MapSectionType["config"];
}

const HEIGHT_MAP = {
  sm: 200,
  md: 300,
  lg: 400,
  xl: 500,
} as const;

const RADIUS_MAP = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-lg",
  lg: "rounded-xl",
} as const;

function extractSrc(input: string): string {
  const match = input.match(/src=["']([^"']+)["']/);
  return match ? match[1] : input.trim();
}

export function MapSection({ config }: MapSectionProps) {
  const { heading, embedUrl, height, borderRadius, caption } = config;
  const src = extractSrc(embedUrl);

  if (!src) {
    return (
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 py-12 text-sm text-muted-foreground">
          Add a Google Maps embed URL to display a map
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 space-y-4">
      {heading && (
        <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
      )}
      <div className={cn("overflow-hidden", RADIUS_MAP[borderRadius])}>
        <iframe
          src={src}
          width="100%"
          height={HEIGHT_MAP[height]}
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={heading || "Map"}
        />
      </div>
      {caption && (
        <p className="text-xs text-muted-foreground">{caption}</p>
      )}
    </div>
  );
}
