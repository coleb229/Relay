"use client";

import { cn } from "@/lib/utils";
import type { z } from "zod";
import type { buttonConfigSchema } from "../schemas";

type ButtonConfig = z.infer<typeof buttonConfigSchema>;

interface ButtonSectionProps {
  config: ButtonConfig;
}

const SIZE_CLASSES = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-base",
  lg: "px-8 py-3.5 text-lg",
} as const;

const RADIUS_CLASSES = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
} as const;

export function ButtonSection({ config }: ButtonSectionProps) {
  const {
    text,
    href,
    target,
    variant,
    size,
    bgColor,
    textColor,
    borderColor,
    borderRadius,
    fullWidth,
  } = config;

  const baseClasses = cn(
    "inline-flex items-center justify-center font-medium transition-all duration-(--dur-feedback) ease-(--ease-out-quart) cursor-pointer",
    SIZE_CLASSES[size],
    RADIUS_CLASSES[borderRadius],
    fullWidth && "w-full"
  );

  const style: React.CSSProperties = {};

  if (variant === "solid") {
    style.backgroundColor = bgColor ?? "oklch(0.44 0.24 275)";
    style.color = textColor ?? "#fff";
    style.border = "2px solid transparent";
  } else if (variant === "outline") {
    style.backgroundColor = "transparent";
    style.color = textColor ?? bgColor ?? "oklch(0.44 0.24 275)";
    style.border = `2px solid ${borderColor ?? bgColor ?? "oklch(0.44 0.24 275)"}`;
  } else {
    style.backgroundColor = "transparent";
    style.color = textColor ?? bgColor ?? "oklch(0.44 0.24 275)";
    style.border = "2px solid transparent";
  }

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        className={baseClasses}
        style={style}
      >
        {text || "Button"}
      </a>
    );
  }

  return (
    <span className={baseClasses} style={style}>
      {text || "Button"}
    </span>
  );
}
