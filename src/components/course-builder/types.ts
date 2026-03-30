export type LessonType =
  | "TEXT"
  | "VIDEO"
  | "QUIZ"
  | "PDF"
  | "AUDIO"
  | "PRESENTATION"
  | "DOWNLOAD"
  | "EMBED"
  | "ASSIGNMENT"
  | "LIVE_SESSION"
  | "SURVEY"
  | "EBOOK"
  | "DISCUSSION"
  | "SCORM";

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

  // File-based types (PDF, PRESENTATION, DOWNLOAD, AUDIO)
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;

  // AUDIO
  audioUrl: string | null;

  // EMBED
  embedCode: string | null;

  // LIVE_SESSION
  meetingUrl: string | null;
  meetingPlatform: string | null;
  scheduledAt: string | null;
  recordingUrl: string | null;

  // ASSIGNMENT
  assignmentType: string | null;
  maxScore: number | null;
  dueDate: string | null;
  allowLate: boolean;
  instructions: string | null;

  // SCORM
  scormPackageUrl: string | null;
  scormVersion: string | null;
  scormEntryPoint: string | null;

  // DISCUSSION
  discussionPrompt: string | null;
}

export interface ModuleData {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  order: number;
  lessons: LessonData[];
}

export type PricingType = "FREE" | "ONE_TIME";

export interface CourseData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  status: CourseStatus;
  price: number | null;
  compareAtPrice: number | null;
  pricingType: PricingType;
  tags: string[];
  instructorId: string;
  categoryId: string | null;
  landingPageSections: unknown[] | null;
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export type Selection =
  | { type: "course" }
  | { type: "module"; moduleId: string }
  | { type: "lesson"; moduleId: string; lessonId: string };

export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";

export interface QuizOptionData {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface QuizQuestionData {
  id: string;
  lessonId: string;
  type: QuestionType;
  prompt: string;
  order: number;
  expectedAnswer: string | null;
  options: QuizOptionData[];
}

export interface AttachmentData {
  id: string;
  name: string;
  url: string;
  size: number;
  createdAt: string;
}
