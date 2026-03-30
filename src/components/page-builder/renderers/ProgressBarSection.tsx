"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ProgressBarSection as ProgressBarSectionType } from "../schemas";

interface ProgressBarSectionProps {
  config: ProgressBarSectionType["config"];
}

const HEIGHT_MAP = {
  sm: "h-2",
  md: "h-4",
  lg: "h-6",
} as const;

const RADIUS_MAP = {
  none: "rounded-none",
  sm: "rounded-sm",
  full: "rounded-full",
} as const;

const DEFAULT_COLOR = "#8b5cf6"; // primary violet

function AnimatedBar({
  value,
  color,
  animate,
  height,
  radius,
  showPercentage,
  label,
}: {
  value: number;
  color: string | null;
  animate: boolean;
  height: string;
  radius: string;
  showPercentage: boolean;
  label: string;
}) {
  const [width, setWidth] = useState(animate ? 0 : value);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!animate || hasAnimated.current) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          // Small delay for visual effect
          requestAnimationFrame(() => setWidth(value));
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animate, value]);

  return (
    <div ref={ref} className="space-y-1.5">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-foreground">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm tabular-nums text-muted-foreground">
              {animate ? width : value}%
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-muted/60 overflow-hidden", height, radius)}>
        <div
          className={cn("h-full transition-all duration-1000 ease-(--ease-out-quart)", radius)}
          style={{
            width: `${width}%`,
            backgroundColor: color || DEFAULT_COLOR,
          }}
        />
      </div>
    </div>
  );
}

export function ProgressBarSection({ config }: ProgressBarSectionProps) {
  const { heading, bars, showPercentage, animate, height, borderRadius } = config;

  if (bars.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6">
        <p className="text-center text-sm text-muted-foreground">
          Add progress bars to display
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 space-y-6">
      {heading && (
        <h2 className="text-2xl font-semibold tracking-tight text-center">
          {heading}
        </h2>
      )}

      <div className="space-y-4">
        {bars.map((bar, i) => (
          <AnimatedBar
            key={`bar-${i}-${bar.label}`}
            value={bar.value}
            color={bar.color}
            animate={animate}
            height={HEIGHT_MAP[height]}
            radius={RADIUS_MAP[borderRadius]}
            showPercentage={showPercentage}
            label={bar.label}
          />
        ))}
      </div>
    </div>
  );
}
