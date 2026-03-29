"use client";

import { cn } from "@/lib/utils";
import type { LogoWallSection as LogoWallSectionType } from "../schemas";

interface LogoWallSectionProps {
  config: LogoWallSectionType["config"];
}

const LOGO_HEIGHT_MAP = {
  sm: "max-h-8",
  md: "max-h-12",
  lg: "max-h-16",
} as const;

export function LogoWallSection({ config }: LogoWallSectionProps) {
  const { heading, logos, grayscale, maxLogoHeight } = config;

  if (!logos || logos.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-center text-sm text-muted-foreground">
          Add logos to display
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6">
      {heading && (
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">
          {heading}
        </h2>
      )}
      <div className="flex flex-wrap items-center justify-center gap-8">
        {logos.map((logo, i) => {
          const img = (
            <img
              key={i}
              src={logo.imageUrl}
              alt={logo.alt}
              className={cn(
                "w-auto object-contain",
                LOGO_HEIGHT_MAP[maxLogoHeight],
                grayscale &&
                  "grayscale transition-all duration-300 hover:grayscale-0"
              )}
            />
          );

          if (logo.link) {
            return (
              <a
                key={i}
                href={logo.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {img}
              </a>
            );
          }

          return img;
        })}
      </div>
    </div>
  );
}
