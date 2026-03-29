"use client";

import { XIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { PageSection, SectionStyle } from "../schemas";
import { SECTION_LABELS } from "../schemas";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { StyleEditor } from "./StyleEditor";

const editorLoading = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-9 w-full rounded-lg" />
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-9 w-full rounded-lg" />
    <Skeleton className="h-4 w-16" />
    <Skeleton className="h-20 w-full rounded-lg" />
  </div>
);

const HeroEditor = dynamic(() => import("./HeroEditor").then((m) => ({ default: m.HeroEditor })), { loading: editorLoading });
const FeaturesGridEditor = dynamic(() => import("./FeaturesGridEditor").then((m) => ({ default: m.FeaturesGridEditor })), { loading: editorLoading });
const RichTextBlockEditor = dynamic(() => import("./RichTextBlockEditor").then((m) => ({ default: m.RichTextBlockEditor })), { loading: editorLoading });
const ImageBlockEditor = dynamic(() => import("./ImageBlockEditor").then((m) => ({ default: m.ImageBlockEditor })), { loading: editorLoading });
const InstructorBioEditor = dynamic(() => import("./InstructorBioEditor").then((m) => ({ default: m.InstructorBioEditor })), { loading: editorLoading });
const CurriculumPreviewEditor = dynamic(() => import("./CurriculumPreviewEditor").then((m) => ({ default: m.CurriculumPreviewEditor })), { loading: editorLoading });
const CallToActionEditor = dynamic(() => import("./CallToActionEditor").then((m) => ({ default: m.CallToActionEditor })), { loading: editorLoading });
const TestimonialsEditor = dynamic(() => import("./TestimonialsEditor").then((m) => ({ default: m.TestimonialsEditor })), { loading: editorLoading });
const FaqAccordionEditor = dynamic(() => import("./FaqAccordionEditor").then((m) => ({ default: m.FaqAccordionEditor })), { loading: editorLoading });
const VideoEmbedEditor = dynamic(() => import("./VideoEmbedEditor").then((m) => ({ default: m.VideoEmbedEditor })), { loading: editorLoading });
const StatsBarEditor = dynamic(() => import("./StatsBarEditor").then((m) => ({ default: m.StatsBarEditor })), { loading: editorLoading });
const PricingTableEditor = dynamic(() => import("./PricingTableEditor").then((m) => ({ default: m.PricingTableEditor })), { loading: editorLoading });
const LogoWallEditor = dynamic(() => import("./LogoWallEditor").then((m) => ({ default: m.LogoWallEditor })), { loading: editorLoading });
const DividerSpacerEditor = dynamic(() => import("./DividerSpacerEditor").then((m) => ({ default: m.DividerSpacerEditor })), { loading: editorLoading });

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
    case "FAQ_ACCORDION":
      return (
        <FaqAccordionEditor
          config={section.config}
          onChange={onConfigChange}
        />
      );
    case "VIDEO_EMBED":
      return (
        <VideoEmbedEditor
          config={section.config}
          onChange={onConfigChange}
        />
      );
    case "STATS_BAR":
      return (
        <StatsBarEditor
          config={section.config}
          onChange={onConfigChange}
        />
      );
    case "PRICING_TABLE":
      return (
        <PricingTableEditor
          config={section.config}
          onChange={onConfigChange}
        />
      );
    case "LOGO_WALL":
      return (
        <LogoWallEditor
          config={section.config}
          onChange={onConfigChange}
        />
      );
    case "DIVIDER_SPACER":
      return (
        <DividerSpacerEditor
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
