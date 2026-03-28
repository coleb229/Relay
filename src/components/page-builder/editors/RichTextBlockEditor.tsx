"use client";

import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/course-builder/RichTextEditor";

interface RichTextBlockEditorProps {
  config: {
    html: string;
  };
  onChange: (config: RichTextBlockEditorProps["config"]) => void;
}

export function RichTextBlockEditor({ config, onChange }: RichTextBlockEditorProps) {
  return (
    <div className="space-y-1.5">
      <Label>Content</Label>
      <RichTextEditor
        value={config.html}
        onChange={(html) => onChange({ ...config, html })}
      />
    </div>
  );
}
