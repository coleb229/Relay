"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Copy, Archive, Trash2, Award } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TemplateStatusBadge } from "./CertificateStatusBadge";
import { CertificatePreview } from "./CertificatePreview";

interface CertificateTemplateCardProps {
  template: {
    id: string;
    name: string;
    description?: string | null;
    status: string;
    orientation: string;
    designData?: unknown;
    backgroundColor?: string | null;
    borderStyle?: string | null;
    logoUrl?: string | null;
    course?: { id: string; title: string } | null;
    _count?: { certificates: number };
    updatedAt: string;
  };
  onDuplicate?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function CertificateTemplateCard({ template, onDuplicate, onArchive, onDelete }: CertificateTemplateCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const certCount = template._count?.certificates ?? 0;

  return (
    <Card className="group relative transition-colors duration-(--dur-feedback) ease-(--ease-out-quart) hover:border-primary/30">
      {/* Preview thumbnail */}
      <div className="px-4 pt-4">
        <Link href={`/certificates/templates/${template.id}`}>
          <CertificatePreview
            designData={template.designData as Parameters<typeof CertificatePreview>[0]["designData"]}
            orientation={template.orientation as "LANDSCAPE" | "PORTRAIT"}
            backgroundColor={template.backgroundColor}
            borderStyle={template.borderStyle}
            logoUrl={template.logoUrl}
            compact
            className="cursor-pointer transition-transform duration-(--dur-feedback) ease-(--ease-out-quart) hover:scale-[1.02]"
            variables={{
              studentName: "Jane Student",
              courseTitle: template.course?.title ?? "Course Title",
              completionDate: "March 2026",
              instructorName: "Instructor",
            }}
          />
        </Link>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 px-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={`/certificates/templates/${template.id}`}
              className="block truncate font-medium text-foreground hover:text-primary transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
            >
              {template.name}
            </Link>
            {template.course && (
              <p className="truncate text-xs text-muted-foreground">{template.course.title}</p>
            )}
            {!template.course && (
              <p className="text-xs text-muted-foreground italic">Global template</p>
            )}
          </div>
          <TemplateStatusBadge status={template.status} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Award className="h-3 w-3" />
            <span>{certCount} issued</span>
          </div>

          {/* Actions */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setMenuOpen(!menuOpen)}
              onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-36 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
                <Link
                  href={`/certificates/templates/${template.id}`}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </Link>
                {onDuplicate && (
                  <button
                    onClick={() => onDuplicate(template.id)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
                  >
                    <Copy className="h-3 w-3" /> Duplicate
                  </button>
                )}
                {onArchive && (
                  <button
                    onClick={() => onArchive(template.id)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
                  >
                    <Archive className="h-3 w-3" /> Archive
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(template.id)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
