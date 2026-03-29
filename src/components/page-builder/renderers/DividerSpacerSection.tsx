"use client";

import { cn } from "@/lib/utils";
import type { DividerSpacerSection as DividerSpacerSectionType } from "../schemas";

interface DividerSpacerSectionProps {
  config: DividerSpacerSectionType["config"];
}

const SPACING_MAP = {
  sm: "py-2",
  md: "py-4",
  lg: "py-8",
  xl: "py-12",
} as const;

const BORDER_STYLE_MAP = {
  line: "border-solid",
  dashed: "border-dashed",
  dotted: "border-dotted",
  space_only: "",
} as const;

const THICKNESS_MAP = {
  thin: "border-t",
  medium: "border-t-2",
  thick: "border-t-4",
} as const;

const WIDTH_MAP = {
  quarter: "max-w-[25%]",
  half: "max-w-[50%]",
  three_quarter: "max-w-[75%]",
  full: "w-full",
} as const;

export function DividerSpacerSection({ config }: DividerSpacerSectionProps) {
  const { variant, thickness, width, color, spacingY } = config;

  if (variant === "space_only") {
    return <div className={SPACING_MAP[spacingY]} />;
  }

  return (
    <div className={SPACING_MAP[spacingY]}>
      <hr
        className={cn(
          "mx-auto",
          BORDER_STYLE_MAP[variant],
          THICKNESS_MAP[thickness],
          WIDTH_MAP[width],
          !color && "border-border"
        )}
        style={color ? { borderColor: color } : undefined}
      />
    </div>
  );
}
