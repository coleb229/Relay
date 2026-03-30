"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface NavGroup {
  label?: string;
  items: { href: string }[];
}

const UNLABELED_GROUP_PREFIX = "__unlabeled_";

function findActiveLabel(pathname: string, groups: NavGroup[]): string | null {
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const isActive = group.items.some(
      (item) =>
        pathname === item.href ||
        (item.href !== "/" && pathname.startsWith(item.href + "/"))
    );
    if (isActive) return group.label ?? `${UNLABELED_GROUP_PREFIX}${i}`;
  }
  return null;
}

const MAX_OPEN = 2;

export function useSidebarSections(pathname: string, groups: NavGroup[]) {
  const groupsRef = useRef(groups);
  groupsRef.current = groups;

  // Initialize with all expanded to match SSR (avoids hydration mismatch)
  // After mount, useEffect narrows it to just the active section
  const [expanded, setExpanded] = useState<Set<string> | "ALL">("ALL");

  // On mount + pathname change: ensure active section is open, cap at MAX_OPEN
  useEffect(() => {
    const active = findActiveLabel(pathname, groupsRef.current);
    setExpanded((prev) => {
      const next = prev === "ALL" ? new Set<string>() : new Set(prev);
      if (active) next.add(active);
      // If over the limit, drop the oldest non-active entries
      if (next.size > MAX_OPEN) {
        for (const label of next) {
          if (label !== active && next.size > MAX_OPEN) {
            next.delete(label);
          }
        }
      }
      return next;
    });
  }, [pathname]);

  const isExpanded = useCallback(
    (label: string) => expanded === "ALL" || expanded.has(label),
    [expanded]
  );

  const toggle = useCallback((label: string) => {
    setExpanded((prev) => {
      const next = prev === "ALL" ? new Set<string>() : new Set(prev);
      if (next.has(label)) {
        // Don't allow closing the active section
        const active = findActiveLabel(
          window.location.pathname,
          groupsRef.current
        );
        if (label === active) return next;
        next.delete(label);
      } else {
        next.add(label);
        // Evict the oldest non-active entry if over limit
        if (next.size > MAX_OPEN) {
          const active = findActiveLabel(
            window.location.pathname,
            groupsRef.current
          );
          for (const l of next) {
            if (l !== active && l !== label && next.size > MAX_OPEN) {
              next.delete(l);
            }
          }
        }
      }
      return next;
    });
  }, []);

  return { isExpanded, toggle };
}
