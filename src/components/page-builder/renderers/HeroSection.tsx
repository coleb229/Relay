import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
          <Button
            variant="default"
            size="lg"
            render={<a href={ctaLink || "#"} />}
            className="mt-8 h-11 bg-white px-6 text-primary shadow-sm hover:bg-white/90 dark:bg-primary-foreground dark:text-primary"
          >
            {ctaText}
          </Button>
        )}
      </div>
    </div>
  );
}
