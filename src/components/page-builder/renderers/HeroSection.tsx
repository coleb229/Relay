import { cn } from "@/lib/utils";
import type { HeroSection as HeroSectionType } from "../schemas";

interface HeroSectionProps {
  config: HeroSectionType["config"];
}

export function HeroSection({ config }: HeroSectionProps) {
  const { title, subtitle, backgroundImageUrl, ctaText, ctaLink, overlayOpacity } = config;

  return (
    <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden">
      {backgroundImageUrl ? (
        <>
          <img
            src={backgroundImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-primary/80 to-primary/40 dark:from-primary/60 dark:to-primary/20" />
      )}

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        {title && (
          <h1
            className={cn(
              "text-4xl font-bold tracking-tight sm:text-5xl",
              backgroundImageUrl ? "text-white" : "text-primary-foreground"
            )}
          >
            {title}
          </h1>
        )}
        {subtitle && (
          <p
            className={cn(
              "mt-4 text-lg",
              backgroundImageUrl
                ? "text-white/80"
                : "text-primary-foreground/70"
            )}
          >
            {subtitle}
          </p>
        )}
        {ctaText && (
          <a
            href={ctaLink || "#"}
            className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-primary shadow-lg transition-all hover:bg-white/90 hover:shadow-xl active:scale-[0.98] dark:bg-primary-foreground dark:text-primary"
          >
            {ctaText}
          </a>
        )}
      </div>
    </div>
  );
}
