"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

interface NavGroup {
  label?: string;
  items: { href: string }[];
}

const STORAGE_KEY = "sidebar_sections";

export function useSidebarSections(pathname: string, groups: NavGroup[]) {
  // All labels that can be collapsed
  const allLabels = useMemo(
    () => groups.filter((g) => g.label).map((g) => g.label!),
    [groups]
  );

  // Initialize with all expanded (matches SSR, avoids hydration mismatch)
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(allLabels)
  );
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        setExpanded(new Set(parsed));
      }
    } catch {
      // Ignore parse errors
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage when expanded changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...expanded]));
    } catch {
      // Ignore storage errors
    }
  }, [expanded, hydrated]);

  // Auto-expand the group containing the active route
  useEffect(() => {
    if (!hydrated) return;
    for (const group of groups) {
      if (!group.label) continue;
      const isActive = group.items.some(
        (item) =>
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href + "/"))
      );
      if (isActive && !expanded.has(group.label)) {
        setExpanded((prev) => new Set([...prev, group.label!]));
      }
    }
  }, [pathname, groups, hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const isExpanded = useCallback(
    (label: string) => expanded.has(label),
    [expanded]
  );

  const toggle = useCallback((label: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }, []);

  return { isExpanded, toggle };
}
