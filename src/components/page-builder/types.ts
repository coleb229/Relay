import type { PageSection } from "./schemas";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface PageBuilderProps {
  courseId: string;
  initialSections: PageSection[] | null;
  courseTitle: string;
  courseDescription: string | null;
  courseImageUrl: string | null;
  courseInstructor: {
    name: string | null;
    image: string | null;
    bio: string | null;
  };
  modules: {
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
}
