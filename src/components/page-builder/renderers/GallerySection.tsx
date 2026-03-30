"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GallerySection as GallerySectionType } from "../schemas";

interface GallerySectionProps {
  config: GallerySectionType["config"];
}

const COLUMN_MAP = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
} as const;

const ASPECT_RATIO_MAP = {
  square: "aspect-square",
  "4:3": "aspect-[4/3]",
  "16:9": "aspect-video",
  auto: "",
} as const;

const GAP_MAP = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
} as const;

function Lightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: GallerySectionType["config"]["images"];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const image = images[index];

  const prev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, prev, next]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-white/20"
      >
        <XIcon className="size-5" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-white/20"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-white/20"
          >
            <ChevronRight className="size-6" />
          </button>
        </>
      )}

      <div
        className="flex max-h-[85vh] max-w-[90vw] flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.imageUrl}
          alt={image.alt}
          className="max-h-[80vh] max-w-full object-contain"
        />
        {image.caption && (
          <p className="mt-3 text-center text-sm text-white/80">
            {image.caption}
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}

export function GallerySection({ config }: GallerySectionProps) {
  const { heading, mode, columnCount, aspectRatio, gap, autoplay, autoplayInterval, images } = config;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);

  // Autoplay for carousel mode
  useEffect(() => {
    if (mode !== "carousel" || !autoplay || images.length <= 1) return;
    const interval = setInterval(() => {
      if (isPaused.current) return;
      setActiveIndex((prev) => {
        const next = prev < images.length - 1 ? prev + 1 : 0;
        scrollRef.current?.children[next]?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
        return next;
      });
    }, (autoplayInterval || 5) * 1000);
    return () => clearInterval(interval);
  }, [mode, autoplay, autoplayInterval, images.length]);

  // Sync activeIndex on scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || mode !== "carousel") return;
    function handleScroll() {
      if (!container) return;
      const scrollLeft = container.scrollLeft;
      const childWidth = container.children[0]?.clientWidth || 1;
      const idx = Math.round(scrollLeft / childWidth);
      setActiveIndex(Math.min(idx, images.length - 1));
    }
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [mode, images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-center text-sm text-muted-foreground">
          Add images to display
        </p>
      </div>
    );
  }

  function scrollTo(idx: number) {
    setActiveIndex(idx);
    scrollRef.current?.children[idx]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-6">
      {heading && (
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">
          {heading}
        </h2>
      )}

      {mode === "grid" ? (
        <div className={cn("grid", COLUMN_MAP[columnCount], GAP_MAP[gap])}>
          {images.map((image, i) => (
            <div key={i} className="group">
              <button
                type="button"
                onClick={() => setLightboxIndex(i)}
                className={cn(
                  "block w-full overflow-hidden rounded-lg",
                  ASPECT_RATIO_MAP[aspectRatio]
                )}
              >
                <img
                  src={image.imageUrl}
                  alt={image.alt}
                  className={cn(
                    "h-full w-full transition-[filter] duration-(--dur-state) ease-(--ease-out-quart) group-hover:brightness-105",
                    aspectRatio === "auto" ? "object-contain" : "object-cover"
                  )}
                />
              </button>
              {image.caption && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {image.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          className="relative"
          onMouseEnter={() => { isPaused.current = true; }}
          onMouseLeave={() => { isPaused.current = false; }}
        >
          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth scrollbar-none"
          >
            {images.map((image, i) => (
              <div
                key={i}
                className="relative min-w-[80%] shrink-0 snap-center sm:min-w-[60%]"
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className={cn(
                    "block w-full overflow-hidden rounded-lg",
                    ASPECT_RATIO_MAP[aspectRatio]
                  )}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.alt}
                    className={cn(
                      "h-full w-full",
                      aspectRatio === "auto" ? "object-contain" : "object-cover"
                    )}
                  />
                </button>
                {image.caption && (
                  <div className="absolute inset-x-0 bottom-0 rounded-b-lg bg-black/50 px-4 py-2">
                    <p className="text-sm text-white">{image.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Nav buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => scrollTo(activeIndex > 0 ? activeIndex - 1 : images.length - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-black/60"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={() => scrollTo(activeIndex < images.length - 1 ? activeIndex + 1 : 0)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-black/60"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(i)}
                  className={cn(
                    "size-2 rounded-full transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)",
                    i === activeIndex ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
