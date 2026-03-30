"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { getIcon } from "../icon-registry";
import type { SocialProofSection as SocialProofSectionType } from "../schemas";

interface SocialProofSectionProps {
  config: SocialProofSectionType["config"];
}

// ── Animated Counter ────────────────────────────────────────────────

function AnimatedCounter({
  value,
  prefix,
  suffix,
  animate,
}: {
  value: number;
  prefix: string;
  suffix: string;
  animate: boolean;
}) {
  const [displayed, setDisplayed] = useState(animate ? 0 : value);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!animate || hasAnimated.current) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1200;
          const start = performance.now();

          function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayed(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animate, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {displayed.toLocaleString()}
      {suffix}
    </span>
  );
}

// ── Activity Feed Item ──────────────────────────────────────────────

function ActivityItem({
  name,
  action,
  timeAgo,
  avatarUrl,
}: {
  name: string;
  action: string;
  timeAgo: string;
  avatarUrl: string | null;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="size-8 rounded-full object-cover"
        />
      ) : (
        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {initials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">
          <span className="font-medium">{name}</span>{" "}
          <span className="text-muted-foreground">{action}</span>
        </p>
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function SocialProofSection({ config }: SocialProofSectionProps) {
  const {
    heading,
    subheading,
    layout,
    stats,
    activityFeed,
    badges,
    showActivityAnimation,
    maxVisibleActivities,
  } = config;

  const showStats = layout === "stats" || layout === "combined";
  const showActivity = layout === "activity" || layout === "combined";
  const showBadges = layout === "badges" || layout === "combined";

  const hasContent =
    (showStats && stats.length > 0) ||
    (showActivity && activityFeed.length > 0) ||
    (showBadges && badges.length > 0);

  if (!hasContent) {
    return (
      <div className="mx-auto max-w-4xl px-6">
        <p className="text-center text-sm text-muted-foreground">
          Add social proof elements to display
        </p>
      </div>
    );
  }

  const visibleActivities = activityFeed.slice(0, maxVisibleActivities);

  return (
    <div className="mx-auto max-w-5xl px-6 space-y-8">
      {/* Heading */}
      {(heading || subheading) && (
        <div className="text-center">
          {heading && (
            <h2 className="text-2xl font-semibold tracking-tight">
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="mt-2 text-sm text-muted-foreground">{subheading}</p>
          )}
        </div>
      )}

      {/* Stats */}
      {showStats && stats.length > 0 && (
        <div
          className={cn(
            "grid grid-cols-1 gap-6 sm:grid-cols-2",
            stats.length === 3 && "lg:grid-cols-3",
            stats.length >= 4 && "lg:grid-cols-4"
          )}
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-bold text-foreground sm:text-4xl">
                <AnimatedCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  animate={stat.animate}
                />
              </p>
              {stat.label && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Activity Feed */}
      {showActivity && visibleActivities.length > 0 && (
        <div
          className={cn(
            "mx-auto max-w-md space-y-2",
            showActivityAnimation && "animate-fade-in"
          )}
        >
          {visibleActivities.map((item, i) => (
            <ActivityItem
              key={i}
              name={item.name}
              action={item.action}
              timeAgo={item.timeAgo}
              avatarUrl={item.avatarUrl}
            />
          ))}
        </div>
      )}

      {/* Trust Badges */}
      {showBadges && badges.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-4">
          {badges.map((badge, i) => {
            const Icon = getIcon(badge.icon);
            return (
              <div
                key={i}
                className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-2"
              >
                {Icon && (
                  <Icon className="size-4 text-primary" />
                )}
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
