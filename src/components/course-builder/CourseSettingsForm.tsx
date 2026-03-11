"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CourseData, CourseStatus } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckIcon, LoaderCircleIcon } from "lucide-react";

interface Props {
  course: CourseData;
  redirectAfterSave: string;
  onUpdate: (data: CourseData) => void;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CourseSettingsForm({ course, redirectAfterSave, onUpdate }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(course.title);
  const [slug, setSlug] = useState(course.slug);
  const [description, setDescription] = useState(course.description ?? "");
  const [status, setStatus] = useState<CourseStatus>(course.status);
  const [price, setPrice] = useState(course.price?.toString() ?? "");
  const [tags, setTags] = useState(course.tags.join(", "));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  async function handleSave() {
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          status,
          price: price !== "" ? parseFloat(price) : null,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) {
        setSaveStatus("error");
        return;
      }

      const updated = await res.json();
      onUpdate(updated);
      setSaveStatus("saved");
      router.push(redirectAfterSave);
    } catch {
      setSaveStatus("error");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold">Course Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Basic metadata for this course.
        </p>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSlug(slugify(e.target.value));
            }}
          />
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <Label htmlFor="slug">
            Slug{" "}
            <span className="text-muted-foreground font-normal">(URL identifier)</span>
          </Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="font-mono text-xs"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What will students learn?"
          />
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as CourseStatus)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price */}
        <div className="space-y-1.5">
          <Label htmlFor="price">
            Price{" "}
            <span className="text-muted-foreground font-normal">(USD, leave blank for free)</span>
          </Label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
              $
            </span>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="pl-6"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <Label htmlFor="tags">
            Tags{" "}
            <span className="text-muted-foreground font-normal">(comma-separated)</span>
          </Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="python, beginner, data-science"
          />
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3 pt-1">
        <Button onClick={handleSave} disabled={saveStatus === "saving"} size="sm">
          {saveStatus === "saving" && (
            <LoaderCircleIcon className="size-3.5 animate-spin" />
          )}
          {saveStatus === "saving" ? "Saving…" : "Save Changes"}
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
