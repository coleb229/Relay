"use client";

import { useState, useEffect, useRef } from "react";
import { Search, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CreateCourseDialog } from "@/components/course-builder/CreateCourseDialog";

interface CourseFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  categoryId: string;
  onCategoryIdChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  categories: { id: string; name: string; color: string | null }[];
  instructorId?: string;
  canCreate: boolean;
  userId?: string;
}

export function CourseFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  categoryId,
  onCategoryIdChange,
  viewMode,
  onViewModeChange,
  categories,
  instructorId,
  canCreate,
  userId,
}: CourseFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [localSearch, onSearchChange]);

  // Keep local in sync if parent resets search
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search */}
        <InputGroup className="w-full sm:max-w-xs">
          <InputGroupAddon>
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search courses..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </InputGroup>

        {/* Status filter */}
        <Select value={status} onValueChange={(v) => { if (v) onStatusChange(v); }}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>

        {/* Category filter */}
        <Select value={categoryId} onValueChange={(v) => { if (v) onCategoryIdChange(v); }}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        {/* View toggle */}
        <ToggleGroup
          value={[viewMode]}
          onValueChange={(values) => {
            if (values.length > 0) {
              onViewModeChange(values[0] as "grid" | "list");
            }
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Create button */}
        {canCreate && userId && (
          <CreateCourseDialog instructorId={instructorId ?? userId} />
        )}
      </div>
    </div>
  );
}
