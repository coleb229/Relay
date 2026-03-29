"use client";

import { cn } from "@/lib/utils";
import type { VideoEmbedSection as VideoEmbedSectionType } from "../schemas";

interface VideoEmbedSectionProps {
  config: VideoEmbedSectionType["config"];
}

function parseVideoUrl(
  url: string
): { provider: string; embedUrl: string } | null {
  if (!url) return null;

  try {
    // YouTube: youtube.com/watch?v=ID or youtu.be/ID
    const ytMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/
    );
    if (ytMatch) {
      return {
        provider: "youtube",
        embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
      };
    }

    // Vimeo: vimeo.com/ID
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return {
        provider: "vimeo",
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      };
    }

    // Custom: use URL as-is if it looks valid
    new URL(url);
    return { provider: "custom", embedUrl: url };
  } catch {
    return null;
  }
}

const ASPECT_RATIO_MAP = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
} as const;

const MAX_WIDTH_MAP = {
  sm: "max-w-sm",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  full: "",
} as const;

export function VideoEmbedSection({ config }: VideoEmbedSectionProps) {
  const { heading, videoUrl, aspectRatio, maxWidth } = config;
  const parsed = parseVideoUrl(videoUrl);

  return (
    <div className="mx-auto px-6">
      {heading && (
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">
          {heading}
        </h2>
      )}
      <div
        className={cn(
          "mx-auto",
          MAX_WIDTH_MAP[maxWidth],
          ASPECT_RATIO_MAP[aspectRatio]
        )}
      >
        {parsed ? (
          <iframe
            src={parsed.embedUrl}
            className="size-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex size-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Enter a video URL to preview
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
