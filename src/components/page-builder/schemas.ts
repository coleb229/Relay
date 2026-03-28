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
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

// ── Shared Style ───────────────────────────────────────────────────

export const sectionStyleSchema = z.object({
  alignment: z.enum(["left", "center", "right"]).default("center"),
  verticalAlignment: z.enum(["top", "center", "bottom"]).default("center"),
  backgroundColor: z.string().nullable().default(null),
  backgroundImageUrl: z.string().nullable().default(null),
  paddingY: z.enum(["sm", "md", "lg", "xl"]).default("md"),
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

export const pageSectionSchema = z.discriminatedUnion("type", [
  heroSectionSchema,
  featuresGridSectionSchema,
  richTextSectionSchema,
  imageBlockSectionSchema,
  instructorBioSectionSchema,
  curriculumPreviewSectionSchema,
  callToActionSectionSchema,
  testimonialsSectionSchema,
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
};
