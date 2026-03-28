import { cn } from "@/lib/utils";
import type { ImageBlockSection as ImageBlockSectionType } from "../schemas";

const MAX_WIDTH_MAP = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  full: "max-w-full",
} as const;

interface ImageBlockSectionProps {
  config: ImageBlockSectionType["config"];
}

export function ImageBlockSection({ config }: ImageBlockSectionProps) {
  const { imageUrl, caption, maxWidth } = config;

  if (!imageUrl) return null;

  return (
    <figure className={cn("mx-auto px-6", MAX_WIDTH_MAP[maxWidth])}>
      <img
        src={imageUrl}
        alt={caption || ""}
        className="w-full rounded-xl shadow-md"
      />
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
