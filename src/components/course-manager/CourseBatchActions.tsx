"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CourseBatchActionsProps {
  selectedCount: number;
  onPublish: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onDeselectAll: () => void;
}

export function CourseBatchActions({
  selectedCount,
  onPublish,
  onUnpublish,
  onArchive,
  onDelete,
  onDeselectAll,
}: CourseBatchActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2">
      <span className="text-sm font-medium">
        {selectedCount} selected
      </span>

      <div className="ml-2 flex items-center gap-1.5">
        <Button size="sm" variant="outline" onClick={onPublish}>
          Publish
        </Button>
        <Button size="sm" variant="outline" onClick={onUnpublish}>
          Unpublish
        </Button>
        <Button size="sm" variant="outline" onClick={onArchive}>
          Archive
        </Button>
        <Button size="sm" variant="destructive" onClick={onDelete}>
          Delete
        </Button>
      </div>

      <Button
        size="sm"
        variant="ghost"
        className="ml-auto"
        onClick={onDeselectAll}
      >
        <X className="size-3.5" />
        Deselect All
      </Button>
    </div>
  );
}
