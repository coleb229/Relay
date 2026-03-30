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
  "BUTTON",
  "COUNTDOWN_TIMER",
  "TABS",
  "ACCORDION",
  "GALLERY",
  "MULTI_COLUMN",
  "SOCIAL_PROOF",
  "BANNER",
  "PROGRESS_BAR",
  "TABLE",
  "CODE_BLOCK",
  "MAP",
  "CONTACT_INFO",
  "EMBED",
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
  // Typography
  fontFamily: z.string().nullable().default(null),
  fontSize: z.enum(["sm", "base", "lg", "xl", "2xl"]).nullable().default(null),
  fontWeight: z.enum(["normal", "medium", "semibold", "bold"]).nullable().default(null),
  lineHeight: z.enum(["tight", "normal", "relaxed", "loose"]).nullable().default(null),
  letterSpacing: z.enum(["tight", "normal", "wide"]).nullable().default(null),
  textColor: z.string().nullable().default(null),
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

export const tabsConfigSchema = z.object({
  heading: z.string().default(""),
  tabs: z
    .array(
      z.object({
        label: z.string().default(""),
        html: z.string().default(""),
      })
    )
    .default([]),
});

export const accordionConfigSchema = z.object({
  heading: z.string().default(""),
  items: z
    .array(
      z.object({
        heading: z.string().default(""),
        content: z.string().default(""),
      })
    )
    .default([]),
  allowMultiOpen: z.boolean().default(false),
});

export const countdownTimerConfigSchema = z.object({
  heading: z.string().default(""),
  targetDate: z.string().default(""),
  expiredMessage: z.string().default("This event has ended"),
  showDays: z.boolean().default(true),
  showSeconds: z.boolean().default(true),
});

export const galleryConfigSchema = z.object({
  heading: z.string().default(""),
  mode: z.enum(["grid", "carousel"]).default("grid"),
  columnCount: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  aspectRatio: z.enum(["square", "4:3", "16:9", "auto"]).default("4:3"),
  gap: z.enum(["sm", "md", "lg"]).default("md"),
  autoplay: z.boolean().default(false),
  autoplayInterval: z.number().default(5),
  images: z
    .array(
      z.object({
        imageUrl: z.string().default(""),
        alt: z.string().default(""),
        caption: z.string().default(""),
      })
    )
    .default([]),
});

export const multiColumnConfigSchema = z.object({
  heading: z.string().default(""),
  subheading: z.string().default(""),
  columnCount: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  gap: z.enum(["sm", "md", "lg"]).default("md"),
  verticalAlign: z.enum(["top", "center", "bottom"]).default("top"),
  equalHeight: z.boolean().default(true),
  columns: z
    .array(
      z.object({
        imageUrl: z.string().nullable().default(null),
        icon: z.string().default(""),
        heading: z.string().default(""),
        text: z.string().default(""),
        buttonText: z.string().default(""),
        buttonLink: z.string().default(""),
      })
    )
    .default([]),
});

export const socialProofConfigSchema = z.object({
  heading: z.string().default(""),
  subheading: z.string().default(""),
  layout: z.enum(["stats", "activity", "badges", "combined"]).default("combined"),
  stats: z
    .array(
      z.object({
        value: z.number().default(0),
        label: z.string().default(""),
        prefix: z.string().default(""),
        suffix: z.string().default(""),
        animate: z.boolean().default(true),
      })
    )
    .default([]),
  activityFeed: z
    .array(
      z.object({
        name: z.string().default(""),
        action: z.string().default("enrolled"),
        timeAgo: z.string().default("2h ago"),
        avatarUrl: z.string().nullable().default(null),
      })
    )
    .default([]),
  badges: z
    .array(
      z.object({
        icon: z.string().default("Shield"),
        label: z.string().default(""),
      })
    )
    .default([]),
  showActivityAnimation: z.boolean().default(true),
  maxVisibleActivities: z.number().default(3),
});

export const bannerConfigSchema = z.object({
  message: z.string().default(""),
  variant: z.enum(["info", "success", "warning", "announcement"]).default("info"),
  icon: z.boolean().default(true),
  ctaText: z.string().default(""),
  ctaLink: z.string().default(""),
  dismissible: z.boolean().default(false),
  sticky: z.boolean().default(false),
});

export const progressBarConfigSchema = z.object({
  heading: z.string().default(""),
  bars: z
    .array(
      z.object({
        label: z.string().default(""),
        value: z.number().min(0).max(100).default(50),
        color: z.string().nullable().default(null),
      })
    )
    .default([]),
  showPercentage: z.boolean().default(true),
  animate: z.boolean().default(true),
  height: z.enum(["sm", "md", "lg"]).default("md"),
  borderRadius: z.enum(["none", "sm", "full"]).default("full"),
});

export const tableConfigSchema = z.object({
  heading: z.string().default(""),
  columns: z
    .array(
      z.object({
        header: z.string().default(""),
        align: z.enum(["left", "center", "right"]).default("left"),
      })
    )
    .default([]),
  rows: z.array(z.array(z.string())).default([]),
  showHeader: z.boolean().default(true),
  striped: z.boolean().default(true),
  bordered: z.boolean().default(false),
  hoverable: z.boolean().default(true),
  compact: z.boolean().default(false),
  caption: z.string().default(""),
});

export const codeBlockConfigSchema = z.object({
  code: z.string().default(""),
  language: z.string().default("plaintext"),
  filename: z.string().default(""),
  showLineNumbers: z.boolean().default(true),
  theme: z.enum(["light", "dark"]).default("dark"),
  wrapLines: z.boolean().default(false),
});

export const mapConfigSchema = z.object({
  heading: z.string().default(""),
  embedUrl: z.string().default(""),
  height: z.enum(["sm", "md", "lg", "xl"]).default("md"),
  borderRadius: z.enum(["none", "sm", "md", "lg"]).default("md"),
  caption: z.string().default(""),
});

export const contactInfoConfigSchema = z.object({
  heading: z.string().default("Contact Us"),
  layout: z.enum(["card", "inline", "split"]).default("card"),
  items: z
    .array(
      z.object({
        type: z
          .enum(["address", "phone", "email", "hours", "custom"])
          .default("custom"),
        icon: z.string().default("MapPin"),
        label: z.string().default(""),
        value: z.string().default(""),
        link: z.string().nullable().default(null),
      })
    )
    .default([]),
  socialLinks: z
    .array(
      z.object({
        platform: z
          .enum([
            "facebook",
            "twitter",
            "instagram",
            "linkedin",
            "youtube",
            "tiktok",
            "github",
            "website",
          ])
          .default("website"),
        url: z.string().default(""),
      })
    )
    .default([]),
  showMap: z.boolean().default(false),
  mapEmbedUrl: z.string().default(""),
  mapHeight: z.enum(["sm", "md", "lg"]).default("sm"),
});

export const embedConfigSchema = z.object({
  mode: z.enum(["url", "html"]).default("url"),
  url: z.string().default(""),
  html: z.string().default(""),
  height: z.enum(["sm", "md", "lg", "xl", "custom"]).default("md"),
  customHeight: z.number().default(400),
  aspectRatio: z.enum(["auto", "16:9", "4:3", "1:1"]).default("auto"),
  showBorder: z.boolean().default(true),
  borderRadius: z.enum(["none", "sm", "md", "lg"]).default("md"),
  caption: z.string().default(""),
});

export const buttonConfigSchema = z.object({
  text: z.string().default("Click Here"),
  href: z.string().default(""),
  target: z.enum(["_self", "_blank"]).default("_self"),
  variant: z.enum(["solid", "outline", "ghost"]).default("solid"),
  size: z.enum(["sm", "md", "lg"]).default("md"),
  bgColor: z.string().nullable().default(null),
  textColor: z.string().nullable().default(null),
  borderColor: z.string().nullable().default(null),
  borderRadius: z.enum(["none", "sm", "md", "lg", "full"]).default("md"),
  fullWidth: z.boolean().default(false),
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

export const buttonSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("BUTTON"),
  config: buttonConfigSchema,
});

export const countdownTimerSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("COUNTDOWN_TIMER"),
  config: countdownTimerConfigSchema,
});

export const tabsSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("TABS"),
  config: tabsConfigSchema,
});

export const accordionSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("ACCORDION"),
  config: accordionConfigSchema,
});

export const gallerySectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("GALLERY"),
  config: galleryConfigSchema,
});

export const multiColumnSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("MULTI_COLUMN"),
  config: multiColumnConfigSchema,
});

export const socialProofSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("SOCIAL_PROOF"),
  config: socialProofConfigSchema,
});

export const bannerSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("BANNER"),
  config: bannerConfigSchema,
});

export const progressBarSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("PROGRESS_BAR"),
  config: progressBarConfigSchema,
});

export const tableSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("TABLE"),
  config: tableConfigSchema,
});

export const codeBlockSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("CODE_BLOCK"),
  config: codeBlockConfigSchema,
});

export const mapSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("MAP"),
  config: mapConfigSchema,
});

export const contactInfoSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("CONTACT_INFO"),
  config: contactInfoConfigSchema,
});

export const embedSectionSchema = z.object({
  ...baseSectionFields,
  type: z.literal("EMBED"),
  config: embedConfigSchema,
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
  buttonSectionSchema,
  countdownTimerSectionSchema,
  tabsSectionSchema,
  accordionSectionSchema,
  gallerySectionSchema,
  multiColumnSectionSchema,
  socialProofSectionSchema,
  bannerSectionSchema,
  progressBarSectionSchema,
  tableSectionSchema,
  codeBlockSectionSchema,
  mapSectionSchema,
  contactInfoSectionSchema,
  embedSectionSchema,
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
export type ButtonSection = z.infer<typeof buttonSectionSchema>;
export type CountdownTimerSection = z.infer<typeof countdownTimerSectionSchema>;
export type TabsSection = z.infer<typeof tabsSectionSchema>;
export type AccordionSection = z.infer<typeof accordionSectionSchema>;
export type GallerySection = z.infer<typeof gallerySectionSchema>;
export type MultiColumnSection = z.infer<typeof multiColumnSectionSchema>;
export type SocialProofSection = z.infer<typeof socialProofSectionSchema>;
export type BannerSection = z.infer<typeof bannerSectionSchema>;
export type ProgressBarSection = z.infer<typeof progressBarSectionSchema>;
export type TableSection = z.infer<typeof tableSectionSchema>;
export type CodeBlockSection = z.infer<typeof codeBlockSectionSchema>;
export type MapSection = z.infer<typeof mapSectionSchema>;
export type ContactInfoSection = z.infer<typeof contactInfoSectionSchema>;
export type EmbedSection = z.infer<typeof embedSectionSchema>;

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
  BUTTON: "Button",
  COUNTDOWN_TIMER: "Countdown",
  TABS: "Tabs",
  ACCORDION: "Accordion",
  GALLERY: "Gallery",
  MULTI_COLUMN: "Multi-Column",
  SOCIAL_PROOF: "Social Proof",
  BANNER: "Banner",
  PROGRESS_BAR: "Progress Bar",
  TABLE: "Table",
  CODE_BLOCK: "Code Block",
  MAP: "Map",
  CONTACT_INFO: "Contact Info",
  EMBED: "Embed",
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
  BUTTON: "RectangleHorizontal",
  COUNTDOWN_TIMER: "Timer",
  TABS: "PanelTop",
  ACCORDION: "ListCollapse",
  GALLERY: "GalleryHorizontalEnd",
  MULTI_COLUMN: "Columns3",
  SOCIAL_PROOF: "TrendingUp",
  BANNER: "Flag",
  PROGRESS_BAR: "BarChart",
  TABLE: "Table2",
  CODE_BLOCK: "Code2",
  MAP: "MapPin",
  CONTACT_INFO: "Contact",
  EMBED: "Globe",
};

// ── Section Categories ────────────────────────────────────────────

export const SECTION_CATEGORY_ORDER = ["content", "media", "layout", "marketing", "people"] as const;
export type SectionCategory = (typeof SECTION_CATEGORY_ORDER)[number];

export const SECTION_CATEGORY_LABELS: Record<SectionCategory, string> = {
  content: "Content",
  media: "Media",
  layout: "Layout",
  marketing: "Marketing",
  people: "People & Info",
};

export const SECTION_CATEGORY_MAP: Record<SectionType, SectionCategory> = {
  HERO: "content",
  RICH_TEXT: "content",
  IMAGE_BLOCK: "content",
  FEATURES_GRID: "content",
  TABLE: "content",
  CODE_BLOCK: "content",
  VIDEO_EMBED: "media",
  GALLERY: "media",
  MAP: "media",
  EMBED: "media",
  MULTI_COLUMN: "layout",
  TABS: "layout",
  ACCORDION: "layout",
  DIVIDER_SPACER: "layout",
  BANNER: "layout",
  BUTTON: "layout",
  CALL_TO_ACTION: "marketing",
  PRICING_TABLE: "marketing",
  TESTIMONIALS: "marketing",
  SOCIAL_PROOF: "marketing",
  STATS_BAR: "marketing",
  LOGO_WALL: "marketing",
  COUNTDOWN_TIMER: "marketing",
  PROGRESS_BAR: "marketing",
  INSTRUCTOR_BIO: "people",
  CURRICULUM_PREVIEW: "people",
  CONTACT_INFO: "people",
  FAQ_ACCORDION: "people",
};
