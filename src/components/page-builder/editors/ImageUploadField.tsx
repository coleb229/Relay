"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { ImageIcon, XIcon, LinkIcon, UploadIcon } from "lucide-react";

interface ImageUploadFieldProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  placeholder?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  placeholder = "https://example.com/image.jpg",
}: ImageUploadFieldProps) {
  const [mode, setMode] = useState<"upload" | "url">(value ? "url" : "upload");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <button
          type="button"
          onClick={() => setMode(mode === "upload" ? "url" : "upload")}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          {mode === "upload" ? (
            <>
              <LinkIcon className="size-3" />
              Use URL
            </>
          ) : (
            <>
              <UploadIcon className="size-3" />
              Upload
            </>
          )}
        </button>
      </div>

      {value && (
        <div className="relative group rounded-lg overflow-hidden border border-input">
          <img
            src={value}
            alt=""
            className="w-full h-32 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <Button
            variant="destructive"
            size="icon-xs"
            className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onChange(null)}
            aria-label="Remove image"
          >
            <XIcon className="size-3" />
          </Button>
        </div>
      )}

      {mode === "upload" ? (
        !value && (
          <div className="rounded-lg border-2 border-dashed border-input p-4 text-center">
            <ImageIcon className="size-8 mx-auto mb-2 text-muted-foreground" />
            <UploadButton<OurFileRouter, "sectionImage">
              endpoint="sectionImage"
              onClientUploadComplete={(res) => {
                if (res?.[0]?.url) onChange(res[0].url);
              }}
              onUploadError={(err) => console.error("Upload error:", err)}
              appearance={{
                button:
                  "bg-primary text-primary-foreground hover:bg-primary/90 text-xs px-3 py-1.5 rounded-md font-medium ut-uploading:bg-primary/70",
                allowedContent: "text-xs text-muted-foreground mt-1",
              }}
            />
          </div>
        )
      ) : (
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
