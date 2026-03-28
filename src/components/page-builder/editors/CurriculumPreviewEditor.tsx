"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface CurriculumPreviewEditorProps {
  config: {
    showDuration: boolean;
  };
  onChange: (config: CurriculumPreviewEditorProps["config"]) => void;
}

export function CurriculumPreviewEditor({
  config,
  onChange,
}: CurriculumPreviewEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Checkbox
          id="show-duration"
          checked={config.showDuration}
          onCheckedChange={(checked) =>
            onChange({ ...config, showDuration: checked })
          }
        />
        <Label htmlFor="show-duration">Show lesson durations</Label>
      </div>

      <div className="rounded-md border bg-muted/30 p-3">
        <p className="text-sm text-muted-foreground">
          This section automatically displays the course curriculum from your
          modules and lessons.
        </p>
      </div>
    </div>
  );
}
