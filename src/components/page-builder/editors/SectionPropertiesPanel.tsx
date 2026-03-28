"use client";

import { XIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { PageSection, SectionStyle } from "../schemas";
import { SECTION_LABELS } from "../schemas";
import { StyleEditor } from "./StyleEditor";
import { HeroEditor } from "./HeroEditor";
import { FeaturesGridEditor } from "./FeaturesGridEditor";
import { RichTextBlockEditor } from "./RichTextBlockEditor";
import { ImageBlockEditor } from "./ImageBlockEditor";
import { InstructorBioEditor } from "./InstructorBioEditor";
import { CurriculumPreviewEditor } from "./CurriculumPreviewEditor";
import { CallToActionEditor } from "./CallToActionEditor";
import { TestimonialsEditor } from "./TestimonialsEditor";

interface SectionPropertiesPanelProps {
  section: PageSection;
  onConfigChange: (config: PageSection["config"]) => void;
  onStyleChange: (style: Partial<SectionStyle>) => void;
  onClose: () => void;
}

function SectionConfigEditor({
  section,
  onConfigChange,
}: {
  section: PageSection;
  onConfigChange: (config: PageSection["config"]) => void;
}) {
  switch (section.type) {
    case "HERO":
      return (
        <HeroEditor
          config={section.config}
          onChange={onConfigChange}
        />
      );
    case "FEATURES_GRID":
      return (
        <FeaturesGridEditor
          config={section.config}
          onChange={onConfigChange}
        />
      );
    case "RICH_TEXT":
      return (
        <RichTextBlockEditor
          config={section.config}
          onChange={onConfigChange}
        />
      );
    case "IMAGE_BLOCK":
      return (
        <ImageBlockEditor
          config={section.config}
          onChange={onConfigChange}
        />
      );
    case "INSTRUCTOR_BIO":
      return <InstructorBioEditor />;
    case "CURRICULUM_PREVIEW":
      return (
        <CurriculumPreviewEditor
          config={section.config}
          onChange={onConfigChange}
        />
      );
    case "CALL_TO_ACTION":
      return (
        <CallToActionEditor
          config={section.config}
          onChange={onConfigChange}
        />
      );
    case "TESTIMONIALS":
      return (
        <TestimonialsEditor
          config={section.config}
          onChange={onConfigChange}
        />
      );
    default:
      return null;
  }
}

export function SectionPropertiesPanel({
  section,
  onConfigChange,
  onStyleChange,
  onClose,
}: SectionPropertiesPanelProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {SECTION_LABELS[section.type]}
        </h3>
        <button
          onClick={onClose}
          className="size-6 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
        >
          <XIcon className="size-3.5" />
        </button>
      </div>

      <Separator />

      {/* Type-specific editor */}
      <SectionConfigEditor section={section} onConfigChange={onConfigChange} />

      <Separator />

      {/* Shared style editor */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Style
        </h4>
        <StyleEditor style={section.style} onChange={onStyleChange} />
      </div>
    </div>
  );
}
