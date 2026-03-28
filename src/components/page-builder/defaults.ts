import type { PageSection } from "./schemas";

let counter = 0;
function genId() {
  counter += 1;
  return `section-${Date.now()}-${counter}`;
}

const defaultStyle = {
  alignment: "center" as const,
  verticalAlignment: "center" as const,
  backgroundColor: null,
  backgroundImageUrl: null,
  paddingY: "md" as const,
};

export function generateDefaultSections(course: {
  title: string;
  description: string | null;
  imageUrl: string | null;
}): PageSection[] {
  return [
    {
      id: genId(),
      type: "HERO",
      order: 0,
      visible: true,
      style: { ...defaultStyle, paddingY: "xl" },
      config: {
        title: course.title,
        subtitle: course.description?.slice(0, 120) ?? "",
        backgroundImageUrl: course.imageUrl,
        ctaText: "Enroll Now",
        ctaLink: "",
        overlayOpacity: 0.5,
      },
    },
    {
      id: genId(),
      type: "RICH_TEXT",
      order: 1,
      visible: true,
      style: defaultStyle,
      config: {
        html: course.description
          ? `<h2>About This Course</h2><p>${course.description}</p>`
          : "<h2>About This Course</h2><p>Add a description for your course.</p>",
      },
    },
    {
      id: genId(),
      type: "CURRICULUM_PREVIEW",
      order: 2,
      visible: true,
      style: defaultStyle,
      config: { showDuration: true },
    },
    {
      id: genId(),
      type: "INSTRUCTOR_BIO",
      order: 3,
      visible: true,
      style: defaultStyle,
      config: {},
    },
    {
      id: genId(),
      type: "CALL_TO_ACTION",
      order: 4,
      visible: true,
      style: { ...defaultStyle, paddingY: "lg" },
      config: {
        heading: "Ready to Get Started?",
        description: `Enroll in ${course.title} today and start learning.`,
        buttonText: "Enroll Now",
        buttonLink: "",
        backgroundColor: null,
      },
    },
  ];
}
