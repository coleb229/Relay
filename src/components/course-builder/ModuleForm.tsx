"use client";

import { useState } from "react";
import type { ModuleData } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckIcon, LoaderCircleIcon, Layers, FileText, Video, HelpCircle } from "lucide-react";

interface Props {
  module: ModuleData;
  onUpdate: (moduleId: string, data: Partial<ModuleData>) => void;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function ModuleForm({ module, onUpdate }: Props) {
  const [title, setTitle] = useState(module.title);
  const [description, setDescription] = useState(module.description ?? "");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const textCount = module.lessons.filter((l) => l.type === "TEXT").length;
  const videoCount = module.lessons.filter((l) => l.type === "VIDEO").length;
  const quizCount = module.lessons.filter((l) => l.type === "QUIZ").length;
  const publishedCount = module.lessons.filter((l) => l.isPublished).length;

  async function handleSave() {
    if (!title.trim()) return;
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/modules/${module.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
        }),
      });

      if (!res.ok) {
        setSaveStatus("error");
        return;
      }

      const updated = await res.json();
      onUpdate(module.id, { title: updated.title, description: updated.description });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold">Module Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {module.lessons.length} lesson{module.lessons.length !== 1 ? "s" : ""} in this module.
        </p>
      </div>

      {/* Module stats */}
      {module.lessons.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Layers className="size-3" />
              {publishedCount}/{module.lessons.length} published
            </span>
            {textCount > 0 && (
              <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
                <FileText className="size-3" /> {textCount}
              </span>
            )}
            {videoCount > 0 && (
              <span className="flex items-center gap-1 text-violet-600 dark:text-violet-400">
                <Video className="size-3" /> {videoCount}
              </span>
            )}
            {quizCount > 0 && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <HelpCircle className="size-3" /> {quizCount}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="module-title">Title</Label>
          <Input
            id="module-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Module title"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="module-description">
            Description{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Textarea
            id="module-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Brief overview of this module"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button
          onClick={handleSave}
          disabled={saveStatus === "saving" || !title.trim()}
          size="sm"
        >
          {saveStatus === "saving" && (
            <LoaderCircleIcon className="size-3.5 animate-spin" />
          )}
          {saveStatus === "saving" ? "Saving…" : "Save"}
        </Button>
        {saveStatus === "saved" && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckIcon className="size-3.5" /> Saved
          </span>
        )}
        {saveStatus === "error" && (
          <span className="text-xs text-destructive">Failed to save. Try again.</span>
        )}
      </div>
    </div>
  );
}
