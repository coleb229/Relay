import type { PageSection, SectionType, SectionStyle } from "./schemas";
import { genSectionId, DEFAULT_SECTION_STYLE } from "./defaults";

// ── Types ──────────────────────────────────────────────────────────

export type TemplateCategory = "minimal" | "standard" | "sales" | "specialized";

export interface TemplateContext {
  title: string;
  description: string | null;
  imageUrl: string | null;
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: TemplateCategory;
  /** Section types in order — used for the visual preview strip */
  sectionPreview: SectionType[];
  generate: (ctx: TemplateContext) => PageSection[];
}

// ── Helpers ────────────────────────────────────────────────────────

function s(overrides?: Partial<SectionStyle>): SectionStyle {
  return { ...DEFAULT_SECTION_STYLE, ...overrides };
}

function section(
  type: SectionType,
  order: number,
  config: PageSection["config"],
  style?: Partial<SectionStyle>
): PageSection {
  return {
    id: genSectionId(),
    type,
    order,
    visible: true,
    style: s(style),
    config,
  } as PageSection;
}

function excerpt(text: string | null, maxLen = 120): string {
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
}

// ── Templates ──────────────────────────────────────────────────────

const blank: PageTemplate = {
  id: "blank",
  name: "Blank Canvas",
  description: "Start from scratch with an empty page",
  icon: "Plus",
  category: "minimal",
  sectionPreview: [],
  generate: () => [],
};

const classic: PageTemplate = {
  id: "classic",
  name: "Classic",
  description: "Hero, course overview, curriculum, instructor bio, and enrollment CTA",
  icon: "BookOpen",
  category: "standard",
  sectionPreview: ["HERO", "RICH_TEXT", "CURRICULUM_PREVIEW", "INSTRUCTOR_BIO", "CALL_TO_ACTION"],
  generate: (ctx) => [
    section("HERO", 0, {
      title: ctx.title,
      subtitle: excerpt(ctx.description),
      backgroundImageUrl: ctx.imageUrl,
      ctaText: "Enroll Now",
      ctaLink: "",
      overlayOpacity: 0.5,
    }, { paddingY: "xl" }),
    section("RICH_TEXT", 1, {
      html: ctx.description
        ? `<h2>About This Course</h2><p>${ctx.description}</p>`
        : "<h2>About This Course</h2><p>Add a description for your course.</p>",
    }),
    section("CURRICULUM_PREVIEW", 2, { showDuration: true }),
    section("INSTRUCTOR_BIO", 3, {}),
    section("CALL_TO_ACTION", 4, {
      heading: "Ready to Get Started?",
      description: `Enroll in ${ctx.title} today and start learning.`,
      buttonText: "Enroll Now",
      buttonLink: "",
      backgroundColor: null,
    }, { paddingY: "lg" }),
  ],
};

const minimal: PageTemplate = {
  id: "minimal",
  name: "Minimal",
  description: "Just the essentials — hero, curriculum, and a call to action",
  icon: "Minimize2",
  category: "minimal",
  sectionPreview: ["HERO", "CURRICULUM_PREVIEW", "CALL_TO_ACTION"],
  generate: (ctx) => [
    section("HERO", 0, {
      title: ctx.title,
      subtitle: excerpt(ctx.description),
      backgroundImageUrl: ctx.imageUrl,
      ctaText: "Enroll Now",
      ctaLink: "",
      overlayOpacity: 0.5,
    }, { paddingY: "xl" }),
    section("CURRICULUM_PREVIEW", 1, { showDuration: true }),
    section("CALL_TO_ACTION", 2, {
      heading: "Start Learning Today",
      description: `Join ${ctx.title} and take the first step.`,
      buttonText: "Enroll Now",
      buttonLink: "",
      backgroundColor: null,
    }, { paddingY: "lg" }),
  ],
};

const sales: PageTemplate = {
  id: "sales",
  name: "Sales Page",
  description: "High-conversion layout with stats, social proof, pricing, and FAQ",
  icon: "TrendingUp",
  category: "sales",
  sectionPreview: ["HERO", "STATS_BAR", "FEATURES_GRID", "TESTIMONIALS", "PRICING_TABLE", "FAQ_ACCORDION", "CALL_TO_ACTION"],
  generate: (ctx) => [
    section("HERO", 0, {
      title: ctx.title,
      subtitle: excerpt(ctx.description),
      backgroundImageUrl: ctx.imageUrl,
      ctaText: "Enroll Now",
      ctaLink: "",
      overlayOpacity: 0.55,
    }, { paddingY: "xl" }),
    section("STATS_BAR", 1, {
      heading: "",
      columnCount: 4 as const,
      columns: [
        { value: "500", label: "Students Enrolled", prefix: "", suffix: "+" },
        { value: "30", label: "Video Lessons", prefix: "", suffix: "" },
        { value: "4.8", label: "Average Rating", prefix: "", suffix: "/5" },
        { value: "12", label: "Hours of Content", prefix: "", suffix: "h" },
      ],
    }),
    section("FEATURES_GRID", 2, {
      heading: "What You'll Learn",
      columnCount: 3 as const,
      columns: [
        { icon: "BookOpen", heading: "Core Concepts", text: "Master the foundational knowledge you need to succeed." },
        { icon: "Code", heading: "Hands-On Projects", text: "Apply what you learn with real-world exercises and projects." },
        { icon: "Award", heading: "Certificate", text: "Earn a certificate of completion to showcase your skills." },
      ],
    }),
    section("TESTIMONIALS", 3, {
      heading: "What Students Say",
      items: [
        { quote: "This course transformed the way I approach my work. Highly recommended!", authorName: "Student Name", authorAvatar: null },
        { quote: "Clear explanations, great pacing, and incredibly practical content.", authorName: "Student Name", authorAvatar: null },
        { quote: "Worth every penny. I've already applied what I learned to my projects.", authorName: "Student Name", authorAvatar: null },
      ],
    }),
    section("PRICING_TABLE", 4, {
      heading: "Pricing",
      description: "One-time purchase, lifetime access",
      showCompareAtPrice: true,
      ctaText: "Enroll Now",
      ctaLink: "",
      features: [
        "Full course access",
        "Downloadable resources",
        "Certificate of completion",
        "Lifetime updates",
      ],
    }),
    section("FAQ_ACCORDION", 5, {
      heading: "Frequently Asked Questions",
      items: [
        { question: "Who is this course for?", answer: "This course is designed for anyone looking to deepen their knowledge in this area." },
        { question: "How long do I have access?", answer: "You get lifetime access from the moment you enroll." },
        { question: "Is there a money-back guarantee?", answer: "Yes, we offer a 30-day money-back guarantee if you're not satisfied." },
      ],
    }),
    section("CALL_TO_ACTION", 6, {
      heading: "Don't Wait — Start Today",
      description: "Join hundreds of students already learning.",
      buttonText: "Enroll Now",
      buttonLink: "",
      backgroundColor: null,
    }, { paddingY: "lg" }),
  ],
};

const professional: PageTemplate = {
  id: "professional",
  name: "Professional",
  description: "Polished layout with features, video preview, curriculum, and testimonials",
  icon: "Briefcase",
  category: "standard",
  sectionPreview: ["HERO", "FEATURES_GRID", "VIDEO_EMBED", "CURRICULUM_PREVIEW", "INSTRUCTOR_BIO", "TESTIMONIALS", "CALL_TO_ACTION"],
  generate: (ctx) => [
    section("HERO", 0, {
      title: ctx.title,
      subtitle: excerpt(ctx.description),
      backgroundImageUrl: ctx.imageUrl,
      ctaText: "Enroll Now",
      ctaLink: "",
      overlayOpacity: 0.5,
    }, { paddingY: "xl" }),
    section("FEATURES_GRID", 1, {
      heading: "What You'll Learn",
      columnCount: 3 as const,
      columns: [
        { icon: "Target", heading: "Practical Skills", text: "Gain hands-on experience with real-world applications." },
        { icon: "Lightbulb", heading: "Expert Insights", text: "Learn best practices from an experienced instructor." },
        { icon: "Rocket", heading: "Career Growth", text: "Build skills that advance your professional development." },
      ],
    }),
    section("VIDEO_EMBED", 2, {
      heading: "Course Preview",
      videoUrl: "",
      provider: "youtube" as const,
      aspectRatio: "16:9" as const,
      maxWidth: "lg" as const,
    }),
    section("CURRICULUM_PREVIEW", 3, { showDuration: true }),
    section("INSTRUCTOR_BIO", 4, {}),
    section("TESTIMONIALS", 5, {
      heading: "Student Reviews",
      items: [
        { quote: "One of the best courses I've taken. Clear, thorough, and practical.", authorName: "Student Name", authorAvatar: null },
        { quote: "The instructor really knows their stuff. Excellent course structure.", authorName: "Student Name", authorAvatar: null },
      ],
    }),
    section("CALL_TO_ACTION", 6, {
      heading: "Ready to Level Up?",
      description: `Start ${ctx.title} today and invest in your future.`,
      buttonText: "Enroll Now",
      buttonLink: "",
      backgroundColor: null,
    }, { paddingY: "lg" }),
  ],
};

const workshop: PageTemplate = {
  id: "workshop",
  name: "Workshop / Webinar",
  description: "Event-focused layout with countdown timer, agenda, and instructor details",
  icon: "CalendarClock",
  category: "specialized",
  sectionPreview: ["HERO", "COUNTDOWN_TIMER", "FEATURES_GRID", "INSTRUCTOR_BIO", "FAQ_ACCORDION", "CALL_TO_ACTION"],
  generate: (ctx) => [
    section("HERO", 0, {
      title: ctx.title,
      subtitle: excerpt(ctx.description) || "Live workshop — limited spots available",
      backgroundImageUrl: ctx.imageUrl,
      ctaText: "Reserve Your Spot",
      ctaLink: "",
      overlayOpacity: 0.55,
    }, { paddingY: "xl" }),
    section("COUNTDOWN_TIMER", 1, {
      heading: "Event Starts In",
      targetDate: "",
      expiredMessage: "This event has ended",
      showDays: true,
      showSeconds: true,
    }),
    section("FEATURES_GRID", 2, {
      heading: "What You'll Cover",
      columnCount: 3 as const,
      columns: [
        { icon: "Presentation", heading: "Live Instruction", text: "Interactive sessions with Q&A and real-time feedback." },
        { icon: "Users", heading: "Small Group", text: "Intimate class size for personalized attention." },
        { icon: "Download", heading: "Materials Included", text: "All slides, worksheets, and recordings provided." },
      ],
    }),
    section("INSTRUCTOR_BIO", 3, {}),
    section("FAQ_ACCORDION", 4, {
      heading: "Workshop Details",
      items: [
        { question: "What do I need to prepare?", answer: "Just bring a laptop and a willingness to learn. All materials will be provided." },
        { question: "Will there be a recording?", answer: "Yes, all enrolled participants receive a recording of the session." },
        { question: "What if I can't attend live?", answer: "You'll have access to the recording and can ask questions asynchronously." },
      ],
    }),
    section("CALL_TO_ACTION", 5, {
      heading: "Spots Are Limited",
      description: "Register now to secure your place in this workshop.",
      buttonText: "Reserve Your Spot",
      buttonLink: "",
      backgroundColor: null,
    }, { paddingY: "lg" }),
  ],
};

const socialProof: PageTemplate = {
  id: "social-proof",
  name: "Social Proof",
  description: "Trust-heavy layout with logos, stats, testimonials, and pricing",
  icon: "Star",
  category: "sales",
  sectionPreview: ["HERO", "LOGO_WALL", "STATS_BAR", "TESTIMONIALS", "FEATURES_GRID", "PRICING_TABLE", "CALL_TO_ACTION"],
  generate: (ctx) => [
    section("HERO", 0, {
      title: ctx.title,
      subtitle: excerpt(ctx.description) || "Join thousands of learners who trust us",
      backgroundImageUrl: ctx.imageUrl,
      ctaText: "Get Started",
      ctaLink: "",
      overlayOpacity: 0.5,
    }, { paddingY: "xl" }),
    section("LOGO_WALL", 1, {
      heading: "Trusted By Leading Companies",
      logos: [],
      grayscale: true,
      maxLogoHeight: "md" as const,
    }),
    section("STATS_BAR", 2, {
      heading: "",
      columnCount: 3 as const,
      columns: [
        { value: "10000", label: "Students Worldwide", prefix: "", suffix: "+" },
        { value: "4.9", label: "Student Rating", prefix: "", suffix: "/5" },
        { value: "95", label: "Completion Rate", prefix: "", suffix: "%" },
      ],
    }),
    section("TESTIMONIALS", 3, {
      heading: "Success Stories",
      items: [
        { quote: "This course completely changed my career trajectory. I can't recommend it enough.", authorName: "Student Name", authorAvatar: null },
        { quote: "The most comprehensive and well-structured course I've ever taken online.", authorName: "Student Name", authorAvatar: null },
        { quote: "I went from beginner to confident practitioner in just a few weeks.", authorName: "Student Name", authorAvatar: null },
      ],
    }),
    section("FEATURES_GRID", 4, {
      heading: "Why Students Choose Us",
      columnCount: 3 as const,
      columns: [
        { icon: "Shield", heading: "Money-Back Guarantee", text: "Full refund within 30 days if you're not completely satisfied." },
        { icon: "Clock", heading: "Lifetime Access", text: "Learn at your own pace — your enrollment never expires." },
        { icon: "Headphones", heading: "Expert Support", text: "Get help when you need it from our dedicated support team." },
      ],
    }),
    section("PRICING_TABLE", 5, {
      heading: "Investment in Your Future",
      description: "One-time payment, lifetime access to everything",
      showCompareAtPrice: true,
      ctaText: "Enroll Now",
      ctaLink: "",
      features: [
        "Complete course access",
        "All downloadable resources",
        "Certificate of completion",
        "Private community access",
        "Lifetime updates",
      ],
    }),
    section("CALL_TO_ACTION", 6, {
      heading: "Join the Community",
      description: "Start your journey alongside thousands of successful students.",
      buttonText: "Get Started Now",
      buttonLink: "",
      backgroundColor: null,
    }, { paddingY: "lg" }),
  ],
};

const contentRich: PageTemplate = {
  id: "content-rich",
  name: "Content Rich",
  description: "In-depth layout with detailed descriptions, images, features, and FAQ",
  icon: "FileText",
  category: "standard",
  sectionPreview: ["HERO", "RICH_TEXT", "IMAGE_BLOCK", "FEATURES_GRID", "CURRICULUM_PREVIEW", "FAQ_ACCORDION", "INSTRUCTOR_BIO", "CALL_TO_ACTION"],
  generate: (ctx) => [
    section("HERO", 0, {
      title: ctx.title,
      subtitle: excerpt(ctx.description),
      backgroundImageUrl: ctx.imageUrl,
      ctaText: "Enroll Now",
      ctaLink: "",
      overlayOpacity: 0.5,
    }, { paddingY: "xl" }),
    section("RICH_TEXT", 1, {
      html: ctx.description
        ? `<h2>Course Overview</h2><p>${ctx.description}</p>`
        : "<h2>Course Overview</h2><p>Provide a detailed overview of what this course covers, who it's for, and what students will achieve.</p>",
    }),
    section("IMAGE_BLOCK", 2, {
      imageUrl: ctx.imageUrl ?? "",
      caption: "",
      maxWidth: "lg" as const,
    }),
    section("FEATURES_GRID", 3, {
      heading: "Key Learning Outcomes",
      columnCount: 3 as const,
      columns: [
        { icon: "CheckCircle", heading: "Outcome 1", text: "Describe what students will be able to do after completing this section." },
        { icon: "CheckCircle", heading: "Outcome 2", text: "Describe another key skill or knowledge area students will master." },
        { icon: "CheckCircle", heading: "Outcome 3", text: "Describe the practical application of what students will learn." },
      ],
    }),
    section("CURRICULUM_PREVIEW", 4, { showDuration: true }),
    section("FAQ_ACCORDION", 5, {
      heading: "Frequently Asked Questions",
      items: [
        { question: "What prerequisites are required?", answer: "Describe any prior knowledge, tools, or experience needed." },
        { question: "How is the course structured?", answer: "Explain the module format, pacing, and expected time commitment." },
        { question: "What support is available?", answer: "Detail discussion forums, office hours, or other support channels." },
      ],
    }),
    section("INSTRUCTOR_BIO", 6, {}),
    section("CALL_TO_ACTION", 7, {
      heading: "Ready to Dive In?",
      description: `Start ${ctx.title} today.`,
      buttonText: "Enroll Now",
      buttonLink: "",
      backgroundColor: null,
    }, { paddingY: "lg" }),
  ],
};

const bootcamp: PageTemplate = {
  id: "bootcamp",
  name: "Bootcamp",
  description: "Intensive program layout with stats, gallery, pricing, and social proof",
  icon: "Flame",
  category: "specialized",
  sectionPreview: ["HERO", "STATS_BAR", "CURRICULUM_PREVIEW", "FEATURES_GRID", "INSTRUCTOR_BIO", "GALLERY", "TESTIMONIALS", "PRICING_TABLE", "CALL_TO_ACTION"],
  generate: (ctx) => [
    section("HERO", 0, {
      title: ctx.title,
      subtitle: excerpt(ctx.description) || "Intensive, hands-on learning experience",
      backgroundImageUrl: ctx.imageUrl,
      ctaText: "Apply Now",
      ctaLink: "",
      overlayOpacity: 0.6,
    }, { paddingY: "xl" }),
    section("STATS_BAR", 1, {
      heading: "Program At A Glance",
      columnCount: 4 as const,
      columns: [
        { value: "8", label: "Weeks", prefix: "", suffix: "" },
        { value: "40", label: "Projects", prefix: "", suffix: "+" },
        { value: "100", label: "Hours of Content", prefix: "", suffix: "h" },
        { value: "92", label: "Job Placement Rate", prefix: "", suffix: "%" },
      ],
    }),
    section("CURRICULUM_PREVIEW", 2, { showDuration: true }),
    section("FEATURES_GRID", 3, {
      heading: "What Makes This Program Different",
      columnCount: 3 as const,
      columns: [
        { icon: "Zap", heading: "Project-Based", text: "Build real-world projects that you can add to your portfolio." },
        { icon: "Users", heading: "Cohort Learning", text: "Learn alongside a group of motivated peers for accountability." },
        { icon: "MessageCircle", heading: "1-on-1 Mentoring", text: "Get personalized feedback and guidance from industry experts." },
      ],
    }),
    section("INSTRUCTOR_BIO", 4, {}),
    section("GALLERY", 5, {
      heading: "Campus & Community",
      mode: "grid" as const,
      columnCount: 3 as const,
      aspectRatio: "4:3" as const,
      gap: "md" as const,
      autoplay: false,
      autoplayInterval: 5,
      images: [],
    }),
    section("TESTIMONIALS", 6, {
      heading: "Graduate Stories",
      items: [
        { quote: "The bootcamp gave me the skills and confidence to land my dream job.", authorName: "Graduate", authorAvatar: null },
        { quote: "Intensive but incredibly rewarding. The projects are what set this apart.", authorName: "Graduate", authorAvatar: null },
      ],
    }),
    section("PRICING_TABLE", 7, {
      heading: "Program Investment",
      description: "Everything you need to launch your new career",
      showCompareAtPrice: true,
      ctaText: "Apply Now",
      ctaLink: "",
      features: [
        "Full program access",
        "1-on-1 mentoring sessions",
        "Career coaching & resume review",
        "Portfolio project reviews",
        "Alumni network access",
        "Job placement support",
      ],
    }),
    section("CALL_TO_ACTION", 8, {
      heading: "Applications Open Now",
      description: "Limited cohort size — apply today to secure your spot.",
      buttonText: "Apply Now",
      buttonLink: "",
      backgroundColor: null,
    }, { paddingY: "lg" }),
  ],
};

const freeCourse: PageTemplate = {
  id: "free-course",
  name: "Free Course",
  description: "Lightweight layout focused on value — features, curriculum, and instructor",
  icon: "Gift",
  category: "standard",
  sectionPreview: ["HERO", "FEATURES_GRID", "CURRICULUM_PREVIEW", "INSTRUCTOR_BIO", "CALL_TO_ACTION"],
  generate: (ctx) => [
    section("HERO", 0, {
      title: ctx.title,
      subtitle: excerpt(ctx.description) || "Free course — start learning right now",
      backgroundImageUrl: ctx.imageUrl,
      ctaText: "Start Free Course",
      ctaLink: "",
      overlayOpacity: 0.5,
    }, { paddingY: "xl" }),
    section("FEATURES_GRID", 1, {
      heading: "What You'll Learn",
      columnCount: 3 as const,
      columns: [
        { icon: "BookOpen", heading: "Topic 1", text: "A clear introduction to the core concepts." },
        { icon: "Lightbulb", heading: "Topic 2", text: "Practical knowledge you can apply right away." },
        { icon: "CheckCircle", heading: "Topic 3", text: "Skills that build a foundation for further learning." },
      ],
    }),
    section("CURRICULUM_PREVIEW", 2, { showDuration: true }),
    section("INSTRUCTOR_BIO", 3, {}),
    section("CALL_TO_ACTION", 4, {
      heading: "It's Completely Free",
      description: `Enroll in ${ctx.title} — no credit card required.`,
      buttonText: "Start Free Course",
      buttonLink: "",
      backgroundColor: null,
    }, { paddingY: "lg" }),
  ],
};

const corporate: PageTemplate = {
  id: "corporate",
  name: "Corporate Training",
  description: "Professional layout with trust indicators, structured curriculum, and stats",
  icon: "Building2",
  category: "specialized",
  sectionPreview: ["HERO", "LOGO_WALL", "FEATURES_GRID", "CURRICULUM_PREVIEW", "STATS_BAR", "CALL_TO_ACTION"],
  generate: (ctx) => [
    section("HERO", 0, {
      title: ctx.title,
      subtitle: excerpt(ctx.description) || "Professional development for your team",
      backgroundImageUrl: ctx.imageUrl,
      ctaText: "Request Access",
      ctaLink: "",
      overlayOpacity: 0.5,
    }, { paddingY: "xl" }),
    section("LOGO_WALL", 1, {
      heading: "Trusted By Industry Leaders",
      logos: [],
      grayscale: true,
      maxLogoHeight: "md" as const,
    }),
    section("FEATURES_GRID", 2, {
      heading: "Training Highlights",
      columnCount: 3 as const,
      columns: [
        { icon: "BarChart3", heading: "Data-Driven", text: "Track team progress and skill development with detailed analytics." },
        { icon: "Lock", heading: "Compliance Ready", text: "Content aligned with industry standards and regulatory requirements." },
        { icon: "RefreshCw", heading: "Always Current", text: "Regular content updates to keep pace with industry changes." },
      ],
    }),
    section("CURRICULUM_PREVIEW", 3, { showDuration: true }),
    section("STATS_BAR", 4, {
      heading: "Training Impact",
      columnCount: 4 as const,
      columns: [
        { value: "200", label: "Companies Trained", prefix: "", suffix: "+" },
        { value: "15000", label: "Employees Certified", prefix: "", suffix: "+" },
        { value: "98", label: "Satisfaction Rate", prefix: "", suffix: "%" },
        { value: "4.9", label: "Average Rating", prefix: "", suffix: "/5" },
      ],
    }),
    section("CALL_TO_ACTION", 5, {
      heading: "Upskill Your Team Today",
      description: "Contact us for team pricing and custom learning paths.",
      buttonText: "Request Access",
      buttonLink: "",
      backgroundColor: null,
    }, { paddingY: "lg" }),
  ],
};

const videoCourse: PageTemplate = {
  id: "video-course",
  name: "Video Course",
  description: "Video-first layout with course preview, features, and student reviews",
  icon: "PlayCircle",
  category: "standard",
  sectionPreview: ["HERO", "VIDEO_EMBED", "FEATURES_GRID", "CURRICULUM_PREVIEW", "INSTRUCTOR_BIO", "TESTIMONIALS", "CALL_TO_ACTION"],
  generate: (ctx) => [
    section("HERO", 0, {
      title: ctx.title,
      subtitle: excerpt(ctx.description),
      backgroundImageUrl: ctx.imageUrl,
      ctaText: "Enroll Now",
      ctaLink: "",
      overlayOpacity: 0.5,
    }, { paddingY: "xl" }),
    section("VIDEO_EMBED", 1, {
      heading: "Watch the Course Preview",
      videoUrl: "",
      provider: "youtube" as const,
      aspectRatio: "16:9" as const,
      maxWidth: "lg" as const,
    }),
    section("FEATURES_GRID", 2, {
      heading: "Course Highlights",
      columnCount: 3 as const,
      columns: [
        { icon: "Play", heading: "HD Video Lessons", text: "Crystal-clear video with professional production quality." },
        { icon: "Subtitles", heading: "Captions Included", text: "Full captions in multiple languages for accessibility." },
        { icon: "Download", heading: "Downloadable", text: "Watch offline — download lessons to any device." },
      ],
    }),
    section("CURRICULUM_PREVIEW", 3, { showDuration: true }),
    section("INSTRUCTOR_BIO", 4, {}),
    section("TESTIMONIALS", 5, {
      heading: "What Students Say",
      items: [
        { quote: "The video quality is outstanding and the explanations are crystal clear.", authorName: "Student Name", authorAvatar: null },
        { quote: "Being able to see the instructor work through problems live makes all the difference.", authorName: "Student Name", authorAvatar: null },
      ],
    }),
    section("CALL_TO_ACTION", 6, {
      heading: "Start Watching Today",
      description: `Get instant access to all ${ctx.title} video lessons.`,
      buttonText: "Enroll Now",
      buttonLink: "",
      backgroundColor: null,
    }, { paddingY: "lg" }),
  ],
};

// ── Export ──────────────────────────────────────────────────────────

export const PAGE_TEMPLATES: PageTemplate[] = [
  blank,
  classic,
  minimal,
  sales,
  professional,
  workshop,
  socialProof,
  contentRich,
  bootcamp,
  freeCourse,
  corporate,
  videoCourse,
];

export const TEMPLATE_CATEGORIES: { value: TemplateCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "minimal", label: "Minimal" },
  { value: "standard", label: "Standard" },
  { value: "sales", label: "Sales" },
  { value: "specialized", label: "Specialized" },
];
