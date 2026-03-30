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
import { FaqAccordionSection } from "./FaqAccordionSection";
import { VideoEmbedSection } from "./VideoEmbedSection";
import { StatsBarSection } from "./StatsBarSection";
import { PricingTableSection } from "./PricingTableSection";
import { LogoWallSection } from "./LogoWallSection";
import { DividerSpacerSection } from "./DividerSpacerSection";
import { ButtonSection } from "./ButtonSection";
import { CountdownTimerSection } from "./CountdownTimerSection";
import { TabsSection } from "./TabsSection";
import { AccordionSection } from "./AccordionSection";
import { GallerySection } from "./GallerySection";
import { MultiColumnSection } from "./MultiColumnSection";
import { SocialProofSection } from "./SocialProofSection";
import { BannerSection } from "./BannerSection";
import { ProgressBarSection } from "./ProgressBarSection";

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
    price?: number | null;
    compareAtPrice?: number | null;
  };
}

const PADDING_Y_MAP = {
  sm: "py-6",
  md: "py-12",
  lg: "py-16",
  xl: "py-24",
} as const;

const PADDING_X_MAP = {
  none: "",
  sm: "px-4",
  md: "px-8",
  lg: "px-12",
} as const;

const ALIGNMENT_MAP = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

const BORDER_RADIUS_MAP = {
  none: "",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
} as const;

const BOX_SHADOW_MAP = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
} as const;

const MAX_WIDTH_MAP = {
  sm: "max-w-sm mx-auto",
  md: "max-w-3xl mx-auto",
  lg: "max-w-5xl mx-auto",
  xl: "max-w-7xl mx-auto",
  full: "",
} as const;

const FONT_SIZE_MAP = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
} as const;

const FONT_WEIGHT_MAP = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
} as const;

const LINE_HEIGHT_MAP = {
  tight: "leading-tight",
  normal: "leading-normal",
  relaxed: "leading-relaxed",
  loose: "leading-loose",
} as const;

const LETTER_SPACING_MAP = {
  tight: "tracking-tight",
  normal: "tracking-normal",
  wide: "tracking-wide",
} as const;

export function SectionRenderer({ section, context }: SectionRendererProps) {
  if (!section.visible) return null;

  const { style } = section;

  const wrapperClassName = cn(
    PADDING_Y_MAP[style.paddingY],
    PADDING_X_MAP[style.paddingX ?? "md"],
    ALIGNMENT_MAP[style.alignment],
    BORDER_RADIUS_MAP[style.borderRadius ?? "none"],
    BOX_SHADOW_MAP[style.boxShadow ?? "none"],
    MAX_WIDTH_MAP[style.maxWidth ?? "full"],
    style.fontSize && FONT_SIZE_MAP[style.fontSize],
    style.fontWeight && FONT_WEIGHT_MAP[style.fontWeight],
    style.lineHeight && LINE_HEIGHT_MAP[style.lineHeight],
    style.letterSpacing && LETTER_SPACING_MAP[style.letterSpacing]
  );

  const wrapperStyle: React.CSSProperties = {};
  if (style.backgroundGradient) {
    wrapperStyle.backgroundImage = style.backgroundGradient;
  } else if (style.backgroundColor) {
    wrapperStyle.backgroundColor = style.backgroundColor;
  }
  if (style.backgroundImageUrl) {
    wrapperStyle.backgroundImage = `url(${style.backgroundImageUrl})`;
    wrapperStyle.backgroundSize = "cover";
    wrapperStyle.backgroundPosition = "center";
  }
  if (style.fontFamily) {
    wrapperStyle.fontFamily = style.fontFamily;
  }
  if (style.textColor) {
    wrapperStyle.color = style.textColor;
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
      case "FAQ_ACCORDION":
        return <FaqAccordionSection config={section.config} />;
      case "VIDEO_EMBED":
        return <VideoEmbedSection config={section.config} />;
      case "STATS_BAR":
        return <StatsBarSection config={section.config} />;
      case "PRICING_TABLE":
        return (
          <PricingTableSection
            config={section.config}
            context={{
              price: context?.price,
              compareAtPrice: context?.compareAtPrice,
            }}
          />
        );
      case "LOGO_WALL":
        return <LogoWallSection config={section.config} />;
      case "DIVIDER_SPACER":
        return <DividerSpacerSection config={section.config} />;
      case "BUTTON":
        return <ButtonSection config={section.config} />;
      case "COUNTDOWN_TIMER":
        return <CountdownTimerSection config={section.config} />;
      case "TABS":
        return <TabsSection config={section.config} />;
      case "ACCORDION":
        return <AccordionSection config={section.config} />;
      case "GALLERY":
        return <GallerySection config={section.config} />;
      case "MULTI_COLUMN":
        return <MultiColumnSection config={section.config} />;
      case "SOCIAL_PROOF":
        return <SocialProofSection config={section.config} />;
      case "BANNER":
        return <BannerSection config={section.config} />;
      case "PROGRESS_BAR":
        return <ProgressBarSection config={section.config} />;
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
