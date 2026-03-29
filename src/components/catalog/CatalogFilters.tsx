"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_CATEGORY_COLOR } from "@/lib/course-utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface CatalogFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryId: string;
  onCategoryIdChange: (value: string) => void;
  categories: { id: string; name: string; color: string | null }[];
}

export function CatalogFilters({
  search,
  onSearchChange,
  categoryId,
  onCategoryIdChange,
  categories,
}: CatalogFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [localSearch, onSearchChange]);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <InputGroup className="w-full sm:max-w-sm">
        <InputGroupAddon>
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search courses..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
      </InputGroup>

      {/* Category pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onCategoryIdChange("all")}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            categoryId === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onCategoryIdChange(cat.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              categoryId === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <span
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: cat.color ?? DEFAULT_CATEGORY_COLOR }}
            />
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
