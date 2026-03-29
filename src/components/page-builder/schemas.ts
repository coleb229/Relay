import { z } from "zod";

// ── Section Types ──────────────────────────────────────────────────

export const SECTION_TYPES = [
  "HERO",
  "FEATURES_GRID",
  "RICH_TEXT",
  "IMAGE_BLOCK",
  "INSTRUCTOR_BIO",
  "CURRICULUM_PREVIEW",
  "CALL_TO_ACTION",
  "TESTIMONIALS",
  "FAQ_ACCORDION",
  "VIDEO_EMBED",
  "STATS_BAR",
  "PRICING_TABLE",
  "LOGO_WALL",
  "DIVIDER_SPACER",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

// ── Shared Style ───────────────────────────────────────────────────

export const sectionStyleSchema = z.object({
  alignment: z.enum(["left", "center", "right"]).default("center"),
  verticalAlignment: z.enum(["top", "center", "bottom"]).default("center"),
  backgroundColor: z.string().nullable().default(null),
  backgroundImageUrl: z.string().nullable().default(null),
  paddingY: z.enum(["sm", "md", "lg", "xl"]).default("md"),
  borderRadius: z.enum(["none", "sm", "md", "lg", "xl", "2xl"]).default("none"),
  boxShadow: z.enum(["none", "sm", "md", "lg"]).default("none"),
  maxWidth: z.enum(["sm", "md", "lg", "xl", "full"]).default("full"),
  backgroundGradient: z.string().nullable().default(null),
  paddingX: z.enum(["none", "sm", "md", "lg"]).default("md"),
});

export type SectionStyle = z.infer<typeof sectionStyleSchema>;

// ── Per-Type Config Schemas ────────────────────────────────────────

export const heroConfigSchema = z.object({
  title: z.string().default(""),
  subtitle: z.string().default(""),
  backgroundImageUrl: z.string().nullable().default(null),
  ctaText: z.string().default("Enroll Now"),
  ctaLink: z.string().default(""),
  overlayOpacity: z.number().min(0).max(1).default(0.5),
});

export const featuresGridConfigSchema = z.object({
  heading: z.string().default("What You'll Learn"),
  columnCount: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  columns: z
    .array(
      z.object({
        icon: z.string().default("BookOpen"),
        heading: z.string().default(""),
        text: z.string().default(""),
      })
    )
    .default([]),
});

export const richTextConfigSchema = z.object({
  html: z.string().default(""),
});

export const imageBlockConfigSchema = z.object({
  imageUrl: z.string().default(""),
  caption: z.string().default(""),
  maxWidth: z.enum(["sm", "md", "lg", "full"]).default("lg"),
});

export const instructorBioConfigSchema = z.object({});

export const curriculumPreviewConfigSchema = z.object({
  showDuration: z.boolean().default(true),
});

export const callToActionConfigSchema = z.object({
  heading: z.string().default("Ready to Get Started?"),
  description: z.string().default(""),
  buttonText: z.string().default("Enroll Now"),
  buttonLink: z.string().default(""),
  backgroundColor: z.string().nullable().default(null),
});

export const testimonialsConfigSchema = z.object({
  heading: z.string().default("What Students Say"),
  items: z
    .array(
      z.object({
        quote: z.string().default(""),
        authorName: z.string().default(""),
        authorAvatar: z.string().nullable().default(null),
      })
    )
    .default([]),
});

// ── New Section Config Schemas ─────────────────────────────────────

export const faqAccordionConfigSchema = z.object({
  heading: z.string().default("Frequently Asked Questions"),
  items: z
    .array(
      z.object({
        question: z.string().default(""),
        answer: z.string().default(""),
      })
    )
    .default([]),
});

export const videoEmbedConfigSchema = z.object({
  heading: z.string().default(""),
  videoUrl: z.string().default(""),
  provider: z.enum(["youtube", "vimeo", "custom"]).default("youtube"),
  aspectRatio: z.enum(["16:9", "4:3", "1:1"]).default("16:9"),
  maxWidth: z.enum(["sm", "md", "lg", "full"]).default("lg"),
});

export const statsBarConfigSchema = z.object({
  heading: z.string().default(""),
  columnCount: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(4),
  columns: z
    .array(
      z.object({
        value: z.string().default("0"),
        label: z.string().default(""),
        prefix: z.string().default(""),
        suffix: z.string().default(""),
      })
    )
    .default([]),
});

export const pricingTableConfigSchema = z.object({
  heading: z.string().default("Pricing"),
  description: z.string().default(""),
  showCompareAtPrice: z.boolean().default(true),
  ctaText: z.string().default("Enroll Now"),
  ctaLink: z.string().default(""),
  features: z.array(z.string()).default([]),
});

export const logoWallConfigSchema = z.object({
  heading: z.string().default("Trusted By"),
  logos: z
    .array(
      z.object({
        imageUrl: z.string().default(""),
        alt: z.string().default(""),
        link: z.string().nullable().default(null),
      })
    )
    .default([]),
  grayscale: z.boolean().default(true),
  maxLogoHeight: z.enum(["sm", "md", "lg"]).default("md"),
});

export const dividerSpacerConfigSchema = z.object({
  variant: z.enum(["line", "dashed", "dotted", "space_only"]).default("line"),
  thickness: z.enum(["thin", "medium", "thick"]).default("thin"),
  width: z.enum(["quarter", "half", "three_quarter", "full"]).default("full"),
  color: z.string().nullable().default(null),
  spacingY: z.enum(["sm", "md", "lg", "xl"]).default("md"),
});

// ── Section Schemas (discriminated union) ──────────────────────────

const baseSectionFields = {
  id: z.string(),
  order: z.number(),
  visible: z.boolean(),
  style: sectionStyleSchema,
};

export const heroSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("HERO"),
  config: heroConfigSchema,
});

export const featuresGridSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("FEATURES_GRID"),
  config: featuresGridConfigSchema,
});

export const richTextSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("RICH_TEXT"),
  config: richTextConfigSchema,
});

export const imageBlockSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("IMAGE_BLOCK"),
  config: imageBlockConfigSchema,
});

export const instructorBioSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("INSTRUCTOR_BIO"),
  config: instructorBioConfigSchema,
});

export const curriculumPreviewSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("CURRICULUM_PREVIEW"),
  config: curriculumPreviewConfigSchema,
});

export const callToActionSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("CALL_TO_ACTION"),
  config: callToActionConfigSchema,
});

export const testimonialsSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("TESTIMONIALS"),
  config: testimonialsConfigSchema,
});

export const faqAccordionSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("FAQ_ACCORDION"),
  config: faqAccordionConfigSchema,
});

export const videoEmbedSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("VIDEO_EMBED"),
  config: videoEmbedConfigSchema,
});

export const statsBarSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("STATS_BAR"),
  config: statsBarConfigSchema,
});

export const pricingTableSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("PRICING_TABLE"),
  config: pricingTableConfigSchema,
});

export const logoWallSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("LOGO_WALL"),
  config: logoWallConfigSchema,
});

export const dividerSpacerSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("DIVIDER_SPACER"),
  config: dividerSpacerConfigSchema,
});

export const pageSectionSchema = z.discriminatedUnion("type", [
  heroSectionSchema,
  featuresGridSectionSchema,
  richTextSectionSchema,
  imageBlockSectionSchema,
  instructorBioSectionSchema,
  curriculumPreviewSectionSchema,
  callToActionSectionSchema,
  testimonialsSectionSchema,
  faqAccordionSectionSchema,
  videoEmbedSectionSchema,
  statsBarSectionSchema,
  pricingTableSectionSchema,
  logoWallSectionSchema,
  dividerSpacerSectionSchema,
]);

export const landingPageSectionsSchema = z.array(pageSectionSchema);

export type PageSection = z.infer<typeof pageSectionSchema>;
export type HeroSection = z.infer<typeof heroSectionSchema>;
export type FeaturesGridSection = z.infer<typeof featuresGridSectionSchema>;
export type RichTextSection = z.infer<typeof richTextSectionSchema>;
export type ImageBlockSection = z.infer<typeof imageBlockSectionSchema>;
export type InstructorBioSection = z.infer<typeof instructorBioSectionSchema>;
export type CurriculumPreviewSection = z.infer<typeof curriculumPreviewSectionSchema>;
export type CallToActionSection = z.infer<typeof callToActionSectionSchema>;
export type TestimonialsSection = z.infer<typeof testimonialsSectionSchema>;
export type FaqAccordionSection = z.infer<typeof faqAccordionSectionSchema>;
export type VideoEmbedSection = z.infer<typeof videoEmbedSectionSchema>;
export type StatsBarSection = z.infer<typeof statsBarSectionSchema>;
export type PricingTableSection = z.infer<typeof pricingTableSectionSchema>;
export type LogoWallSection = z.infer<typeof logoWallSectionSchema>;
export type DividerSpacerSection = z.infer<typeof dividerSpacerSectionSchema>;

// ── Section Labels & Icons ─────────────────────────────────────────

export const SECTION_LABELS: Record<SectionType, string> = {
  HERO: "Hero Banner",
  FEATURES_GRID: "Features Grid",
  RICH_TEXT: "Rich Text",
  IMAGE_BLOCK: "Image",
  INSTRUCTOR_BIO: "Instructor Bio",
  CURRICULUM_PREVIEW: "Curriculum Preview",
  CALL_TO_ACTION: "Call to Action",
  TESTIMONIALS: "Testimonials",
  FAQ_ACCORDION: "FAQ",
  VIDEO_EMBED: "Video Embed",
  STATS_BAR: "Stats Bar",
  PRICING_TABLE: "Pricing",
  LOGO_WALL: "Logo Wall",
  DIVIDER_SPACER: "Divider",
};

export const SECTION_ICONS: Record<SectionType, string> = {
  HERO: "ImageIcon",
  FEATURES_GRID: "LayoutGrid",
  RICH_TEXT: "FileText",
  IMAGE_BLOCK: "Image",
  INSTRUCTOR_BIO: "User",
  CURRICULUM_PREVIEW: "BookOpen",
  CALL_TO_ACTION: "MousePointerClick",
  TESTIMONIALS: "MessageSquareQuote",
  FAQ_ACCORDION: "HelpCircle",
  VIDEO_EMBED: "PlayCircle",
  STATS_BAR: "BarChart3",
  PRICING_TABLE: "CreditCard",
  LOGO_WALL: "Building2",
  DIVIDER_SPACER: "Minus",
};
