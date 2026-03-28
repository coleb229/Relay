"use client";

import { cn } from "@/lib/utils";
import type { PageSection } from "../schemas";
import { HeroSection } from "./HeroSection";
import { FeaturesGridSection } from "./FeaturesGridSection";
import { RichTextSection } from "./RichTextSection";
import { ImageBlockSection } from "./ImageBlockSection";
import { InstructorBioSection } from "./InstructorBioSection";
import { CurriculumPreviewSection } from "./CurriculumPreviewSection";
import { CallToActionSection } from "./CallToActionSection";
import { TestimonialsSection } from "./TestimonialsSection";

export interface SectionRendererProps {
  section: PageSection;
  context?: {
    courseId?: string;
    modules?: {
      id: string;
      title: string;
      lessons: {
        id: string;
        title: string;
        type: string;
        duration: number | null;
        isPublished: boolean;
      }[];
    }[];
    instructor?: {
      name: string | null;
      image: string | null;
      bio: string | null;
      courseCount?: number;
    };
    enrolled?: boolean;
    completedLessonIds?: Set<string>;
  };
}

const PADDING_Y_MAP = {
  sm: "py-6",
  md: "py-12",
  lg: "py-16",
  xl: "py-24",
} as const;

const ALIGNMENT_MAP = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

export function SectionRenderer({ section, context }: SectionRendererProps) {
  if (!section.visible) return null;

  const { style } = section;

  const wrapperClassName = cn(
    PADDING_Y_MAP[style.paddingY],
    ALIGNMENT_MAP[style.alignment]
  );

  const wrapperStyle: React.CSSProperties = {};
  if (style.backgroundColor) {
    wrapperStyle.backgroundColor = style.backgroundColor;
  }
  if (style.backgroundImageUrl) {
    wrapperStyle.backgroundImage = `url(${style.backgroundImageUrl})`;
    wrapperStyle.backgroundSize = "cover";
    wrapperStyle.backgroundPosition = "center";
  }

  function renderSection() {
    switch (section.type) {
      case "HERO":
        return <HeroSection config={section.config} />;
      case "FEATURES_GRID":
        return <FeaturesGridSection config={section.config} />;
      case "RICH_TEXT":
        return <RichTextSection config={section.config} />;
      case "IMAGE_BLOCK":
        return <ImageBlockSection config={section.config} />;
      case "INSTRUCTOR_BIO":
        return <InstructorBioSection instructor={context?.instructor} />;
      case "CURRICULUM_PREVIEW":
        return (
          <CurriculumPreviewSection
            config={section.config}
            modules={context?.modules}
            completedLessonIds={context?.completedLessonIds}
          />
        );
      case "CALL_TO_ACTION":
        return <CallToActionSection config={section.config} />;
      case "TESTIMONIALS":
        return <TestimonialsSection config={section.config} />;
      default:
        return null;
    }
  }

  return (
    <section className={wrapperClassName} style={wrapperStyle}>
      {renderSection()}
    </section>
  );
}
