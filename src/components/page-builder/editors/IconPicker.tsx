"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Search, BookOpen } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  ICON_CATEGORIES,
  CATEGORY_NAMES,
  getIcon,
  searchIcons,
  type IconCategory,
} from "../icon-registry";

interface IconPickerProps {
  value: string;
  onSelect: (iconName: string) => void;
  /** Size of the trigger button */
  size?: "sm" | "md";
}

/** Max icons to show per category page */
const ICONS_PER_PAGE = 60;

export function IconPicker({ value, onSelect, size = "sm" }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<IconCategory>("Popular");
  const searchRef = useRef<HTMLInputElement>(null);

  const IconComponent = getIcon(value) ?? BookOpen;

  // Focus search input when popover opens
  useEffect(() => {
    if (open) {
      // Small delay to let the popover render
      const t = setTimeout(() => searchRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else {
      setQuery("");
    }
  }, [open]);

  const displayedIcons = useMemo(() => {
    if (query.trim()) {
      return searchIcons(query, ICONS_PER_PAGE);
    }
    return ICON_CATEGORIES[activeCategory] ?? [];
  }, [query, activeCategory]);

  const handleSelect = useCallback(
    (name: string) => {
      onSelect(name);
      setOpen(false);
    },
    [onSelect]
  );

  const triggerSize = size === "sm" ? "size-8" : "size-9";
  const iconSize = size === "sm" ? "size-4" : "size-5";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex items-center justify-center rounded-md border border-input bg-background transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:bg-muted",
          triggerSize
        )}
        aria-label="Pick icon"
      >
        <IconComponent className={iconSize} />
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={4}
        className="w-80 p-0"
      >
        {/* Search */}
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search className="size-3.5 text-muted-foreground shrink-0" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search icons..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category tabs — hidden during search */}
        {!query.trim() && (
          <div className="flex gap-0.5 overflow-x-auto border-b px-2 py-1.5 scrollbar-none">
            {CATEGORY_NAMES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "shrink-0 rounded-md px-2 py-1 text-[11px] font-medium transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)",
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Icon grid */}
        <div className="max-h-64 overflow-y-auto p-2">
          {displayedIcons.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              {query.trim() ? "No icons found" : "No icons in this category"}
            </p>
          ) : (
            <div className="grid grid-cols-8 gap-0.5">
              {displayedIcons.map((name) => {
                const Icon = getIcon(name);
                if (!Icon) return null;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleSelect(name)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-md transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)",
                      value === name
                        ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                        : "hover:bg-muted text-foreground"
                    )}
                    title={name}
                  >
                    <Icon className="size-4" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer — current selection */}
        <div className="border-t px-3 py-1.5">
          <p className="text-[11px] text-muted-foreground truncate">
            {value ? (
              <>
                Selected: <span className="font-medium text-foreground">{value}</span>
              </>
            ) : (
              "Click an icon to select"
            )}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
