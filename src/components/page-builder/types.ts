import type { PageSection } from "./schemas";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface PageBuilderContext {
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
  price?: number | null;
  compareAtPrice?: number | null;
}

export interface PageBuilderProps {
  /** API endpoint to PATCH sections to (e.g. "/api/courses/abc" or "/api/pages/xyz") */
  saveEndpoint: string;
  /** JSON key to wrap sections under (e.g. "landingPageSections" or "sections") */
  savePayloadKey: string;
  initialSections: PageSection[] | null;
  /** Context for section renderers that need course data (instructor bio, curriculum, etc.) */
  context?: PageBuilderContext;
  /** Default sections generator — if null, starts with empty canvas */
  defaultSectionsConfig?: {
    title: string;
    description: string | null;
    imageUrl: string | null;
  } | null;
}
