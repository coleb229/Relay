export type LessonType = "TEXT" | "VIDEO" | "QUIZ";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface LessonData {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  content: string | null;
  videoUrl: string | null;
  order: number;
  duration: number | null;
  type: LessonType;
  isPublished: boolean;
}

export interface ModuleData {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  order: number;
  lessons: LessonData[];
}

export interface CourseData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  status: CourseStatus;
  price: number | null;
  tags: string[];
  instructorId: string;
}

export type Selection =
  | { type: "course" }
  | { type: "module"; moduleId: string }
  | { type: "lesson"; moduleId: string; lessonId: string };
