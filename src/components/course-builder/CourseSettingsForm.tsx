"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CourseData, CourseStatus, CategoryData } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckIcon, LoaderCircleIcon, XIcon, ImageIcon, DollarSignIcon, SettingsIcon, TagIcon } from "lucide-react";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { PricingFields } from "@/components/payments/PricingFields";

interface Props {
  course: CourseData;
  categories: CategoryData[];
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

export function CourseSettingsForm({ course, categories, redirectAfterSave, onUpdate }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(course.title);
  const [slug, setSlug] = useState(course.slug);
  const [description, setDescription] = useState(course.description ?? "");
  const [status, setStatus] = useState<CourseStatus>(course.status);
  const [price, setPrice] = useState(course.price?.toString() ?? "");
  const [tags, setTags] = useState(course.tags.join(", "));
  const [imageUrl, setImageUrl] = useState(course.imageUrl ?? "");
  const [categoryId, setCategoryId] = useState(course.categoryId ?? "");
  const [compareAtPrice, setCompareAtPrice] = useState(
    course.compareAtPrice?.toString() ?? ""
  );
  const [pricingType, setPricingType] = useState(
    course.pricingType ?? "FREE"
  );
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
          compareAtPrice: compareAtPrice !== "" ? parseFloat(compareAtPrice) : null,
          pricingType,
          imageUrl: imageUrl.trim() || null,
          categoryId: categoryId || null,
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
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Course Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure your course details, media, and pricing.
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList variant="line" className="w-full justify-start border-b border-border pb-px">
          <TabsTrigger value="general" className="gap-1.5">
            <SettingsIcon className="size-3.5" />
            General
          </TabsTrigger>
          <TabsTrigger value="media" className="gap-1.5">
            <ImageIcon className="size-3.5" />
            Media
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-1.5">
            <DollarSignIcon className="size-3.5" />
            Pricing & Access
          </TabsTrigger>
        </TabsList>

        {/* ── General Tab ─────────────────────────────────────── */}
        <TabsContent value="general" className="pt-5 space-y-4">
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

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="No category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No category</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      {cat.color && (
                        <span
                          className="inline-block size-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                      )}
                      {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label htmlFor="tags" className="flex items-center gap-1.5">
              <TagIcon className="size-3.5" />
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
        </TabsContent>

        {/* ── Media Tab ───────────────────────────────────────── */}
        <TabsContent value="media" className="pt-5 space-y-4">
          <div className="space-y-1.5">
            <Label>Cover Image</Label>
            <p className="text-xs text-muted-foreground">
              Recommended: 16:9 ratio, at least 1280×720px.
            </p>
          </div>

          {imageUrl ? (
            <div className="relative w-full max-w-lg aspect-video rounded-lg overflow-hidden border border-border bg-muted">
              <img src={imageUrl} alt="Course cover" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 hover:bg-background transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) shadow-sm"
                aria-label="Remove image"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          ) : (
            <div className="w-full max-w-lg aspect-video rounded-lg border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-2">
              <ImageIcon className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No cover image</p>
            </div>
          )}

          <div className="max-w-lg space-y-3">
            <UploadButton<OurFileRouter, "courseImage">
              endpoint="courseImage"
              onClientUploadComplete={(res) => {
                if (res?.[0]?.url) setImageUrl(res[0].url);
              }}
              onUploadError={(err) => console.error("Upload error:", err)}
              appearance={{
                button: "ut-ready:bg-primary ut-ready:text-primary-foreground ut-uploading:opacity-60 text-xs h-8 px-3 rounded-md font-medium",
                allowedContent: "text-muted-foreground text-xs",
              }}
            />

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex-1 border-t border-border" />
              or paste a URL
              <span className="flex-1 border-t border-border" />
            </div>

            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/cover.jpg"
            />
          </div>
        </TabsContent>

        {/* ── Pricing & Access Tab ────────────────────────────── */}
        <TabsContent value="pricing" className="pt-5 space-y-4">
          <PricingFields
            pricingType={pricingType}
            price={price}
            compareAtPrice={compareAtPrice}
            onPricingTypeChange={(v) => setPricingType(v as "FREE" | "ONE_TIME")}
            onPriceChange={setPrice}
            onCompareAtPriceChange={setCompareAtPrice}
          />
        </TabsContent>
      </Tabs>

      {/* Save button — always visible */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
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
