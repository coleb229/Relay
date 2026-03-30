import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../../../auth";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { QuizView } from "@/components/quiz/QuizView";
import { DiscussionThread } from "@/components/lesson-player/DiscussionThread";
import { SurveyView } from "@/components/lesson-player/SurveyView";
import { AssignmentSubmit } from "@/components/lesson-player/AssignmentSubmit";
import {
  ChevronLeftIcon,
  FileTextIcon,
  VideoIcon,
  HelpCircleIcon,
  FileIcon,
  HeadphonesIcon,
  PresentationIcon,
  DownloadIcon,
  CodeIcon,
  ClipboardCheckIcon,
  RadioIcon,
  ClipboardListIcon,
  BookOpenIcon,
  MessageSquareIcon,
  PackageIcon,
  ExternalLinkIcon,
  CalendarIcon,
  ClockIcon,
  DownloadCloudIcon,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string; lessonId: string }>;
}

// Semantic color groups: content, interactive, assessment, community, system
const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  TEXT: {
    label: "Text",
    icon: <FileTextIcon className="size-3.5" />,
    color: "text-sky-600 dark:text-sky-400",
  },
  VIDEO: {
    label: "Video",
    icon: <VideoIcon className="size-3.5" />,
    color: "text-violet-600 dark:text-violet-400",
  },
  QUIZ: {
    label: "Quiz",
    icon: <HelpCircleIcon className="size-3.5" />,
    color: "text-amber-600 dark:text-amber-400",
  },
  PDF: {
    label: "PDF",
    icon: <FileIcon className="size-3.5" />,
    color: "text-sky-600 dark:text-sky-400",
  },
  AUDIO: {
    label: "Audio",
    icon: <HeadphonesIcon className="size-3.5" />,
    color: "text-slate-600 dark:text-slate-400",
  },
  PRESENTATION: {
    label: "Presentation",
    icon: <PresentationIcon className="size-3.5" />,
    color: "text-violet-600 dark:text-violet-400",
  },
  DOWNLOAD: {
    label: "Download",
    icon: <DownloadIcon className="size-3.5" />,
    color: "text-slate-600 dark:text-slate-400",
  },
  EMBED: {
    label: "Embed",
    icon: <CodeIcon className="size-3.5" />,
    color: "text-violet-600 dark:text-violet-400",
  },
  ASSIGNMENT: {
    label: "Assignment",
    icon: <ClipboardCheckIcon className="size-3.5" />,
    color: "text-amber-600 dark:text-amber-400",
  },
  LIVE_SESSION: {
    label: "Live Session",
    icon: <RadioIcon className="size-3.5" />,
    color: "text-pink-600 dark:text-pink-400",
  },
  SURVEY: {
    label: "Survey",
    icon: <ClipboardListIcon className="size-3.5" />,
    color: "text-pink-600 dark:text-pink-400",
  },
  EBOOK: {
    label: "Ebook",
    icon: <BookOpenIcon className="size-3.5" />,
    color: "text-sky-600 dark:text-sky-400",
  },
  DISCUSSION: {
    label: "Discussion",
    icon: <MessageSquareIcon className="size-3.5" />,
    color: "text-pink-600 dark:text-pink-400",
  },
  SCORM: {
    label: "SCORM",
    icon: <PackageIcon className="size-3.5" />,
    color: "text-violet-600 dark:text-violet-400",
  },
};

export default async function LessonPage({ params }: Props) {
  const [{ id, lessonId }, session] = await Promise.all([params, auth()]);

  if (!session) redirect("/");

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      questions: {
        include: { options: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
      module: { select: { courseId: true, title: true } },
    },
  });

  if (!lesson || lesson.module.courseId !== id) notFound();

  const isStaff =
    session.user.role === "ADMIN" || session.user.role === "INSTRUCTOR";

  if (!isStaff) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: id } },
    });
    if (!enrollment) redirect(`/courses/${id}`);
  }

  // Fetch latest attempt for QUIZ lessons
  let latestAttempt: {
    score: number;
    answers: Array<{
      questionId: string;
      isCorrect: boolean;
      selectedOptionId: string | null;
      textAnswer: string | null;
    }>;
  } | null = null;

  if (lesson.type === "QUIZ" && session.user.id) {
    const attempt = await prisma.quizAttempt.findFirst({
      where: { lessonId, userId: session.user.id },
      orderBy: { submittedAt: "desc" },
      include: { answers: true },
    });

    if (attempt) {
      latestAttempt = {
        score: attempt.score,
        answers: attempt.answers.map((a) => ({
          questionId: a.questionId,
          isCorrect: a.isCorrect,
          selectedOptionId: a.selectedOptionId,
          textAnswer: a.textAnswer,
        })),
      };
    }
  }

  const typeConfig = TYPE_CONFIG[lesson.type] ?? {
    label: lesson.type,
    icon: <FileTextIcon className="size-3.5" />,
    color: "text-muted-foreground",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href={`/courses/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeftIcon className="size-4" />
          Back to course
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-semibold tracking-tight">{lesson.title}</h1>
          <Badge variant="outline" className={`text-xs ${typeConfig.color}`}>
            {typeConfig.icon}
            {typeConfig.label}
          </Badge>
          {!lesson.isPublished && (
            <Badge variant="secondary" className="text-xs">
              Draft
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Module: {lesson.module.title}
        </p>
        {lesson.description && (
          <p className="text-sm text-muted-foreground">{lesson.description}</p>
        )}
      </div>

      {/* ── Content by type ── */}

      {/* TEXT */}
      {lesson.type === "TEXT" && (
        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: lesson.content ?? "" }}
        />
      )}

      {/* VIDEO */}
      {lesson.type === "VIDEO" && (
        <div className="space-y-2">
          {lesson.videoUrl ? (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                src={lesson.videoUrl}
                className="w-full h-full"
                allowFullScreen
                title={lesson.title}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No video URL provided.
            </p>
          )}
          {lesson.duration && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ClockIcon className="size-3" />
              <span className="tabular-nums">{Math.round(lesson.duration / 60)} min</span>
            </p>
          )}
        </div>
      )}

      {/* QUIZ */}
      {lesson.type === "QUIZ" && (
        <QuizView
          lessonId={lessonId}
          questions={lesson.questions.map((q) => ({
            id: q.id,
            type: q.type,
            prompt: q.prompt,
            expectedAnswer: q.expectedAnswer,
            options: q.options.map((o) => ({ id: o.id, text: o.text })),
          }))}
          latestAttempt={latestAttempt}
        />
      )}

      {/* PDF */}
      {lesson.type === "PDF" && (
        <div className="space-y-3">
          {lesson.fileUrl ? (
            <>
              <div className="rounded-lg overflow-hidden border border-border bg-muted">
                <iframe
                  src={lesson.fileUrl}
                  className="w-full"
                  style={{ height: "80vh" }}
                  title={lesson.fileName ?? lesson.title}
                />
              </div>
              <a
                href={lesson.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLinkIcon className="size-3.5" />
                Open in new tab
              </a>
            </>
          ) : (
            <EmptyContent message="No PDF file has been uploaded yet." />
          )}
        </div>
      )}

      {/* AUDIO */}
      {lesson.type === "AUDIO" && (
        <div className="space-y-4">
          {lesson.audioUrl || lesson.fileUrl ? (
            <div className="rounded-lg border border-border bg-muted/30 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="size-16 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <HeadphonesIcon className="size-8 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="font-medium">
                    {lesson.fileName ?? lesson.title}
                  </p>
                  {lesson.duration && (
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {Math.round(lesson.duration / 60)} min
                    </p>
                  )}
                </div>
              </div>
              <audio
                controls
                className="w-full"
                src={lesson.audioUrl ?? lesson.fileUrl ?? undefined}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : (
            <EmptyContent message="No audio file has been uploaded yet." />
          )}
        </div>
      )}

      {/* PRESENTATION */}
      {lesson.type === "PRESENTATION" && (
        <div className="space-y-3">
          {lesson.fileUrl ? (
            <>
              <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                <iframe
                  src={lesson.fileUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title={lesson.fileName ?? lesson.title}
                />
              </div>
              <a
                href={lesson.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLinkIcon className="size-3.5" />
                Open in new tab
              </a>
            </>
          ) : (
            <EmptyContent message="No presentation has been uploaded yet." />
          )}
        </div>
      )}

      {/* DOWNLOAD */}
      {lesson.type === "DOWNLOAD" && (
        <div className="space-y-3">
          {lesson.fileUrl ? (
            <div className="rounded-lg border border-border bg-muted/30 p-6 flex items-center gap-4">
              <div className="size-14 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <DownloadCloudIcon className="size-7 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {lesson.fileName ?? "Download file"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click below to download this resource
                </p>
              </div>
              <a
                href={lesson.fileUrl}
                download={lesson.fileName ?? undefined}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
              >
                <DownloadIcon className="size-4" />
                Download
              </a>
            </div>
          ) : (
            <EmptyContent message="No file has been uploaded yet." />
          )}
        </div>
      )}

      {/* EMBED */}
      {lesson.type === "EMBED" && (
        <div className="space-y-3">
          {lesson.embedCode ? (
            <div className="rounded-lg overflow-hidden border border-border">
              {lesson.embedCode.trim().startsWith("<") ? (
                <div
                  className="w-full [&>iframe]:w-full [&>iframe]:min-h-[60vh]"
                  dangerouslySetInnerHTML={{ __html: lesson.embedCode }}
                />
              ) : (
                <iframe
                  src={lesson.embedCode.trim()}
                  className="w-full"
                  style={{ height: "70vh" }}
                  allowFullScreen
                  title={lesson.title}
                />
              )}
            </div>
          ) : (
            <EmptyContent message="No embed content has been configured." />
          )}
        </div>
      )}

      {/* LIVE_SESSION */}
      {lesson.type === "LIVE_SESSION" && (
        <LiveSessionContent
          meetingUrl={lesson.meetingUrl}
          meetingPlatform={lesson.meetingPlatform}
          scheduledAt={lesson.scheduledAt}
          duration={lesson.duration}
          recordingUrl={lesson.recordingUrl}
          title={lesson.title}
        />
      )}

      {/* ASSIGNMENT */}
      {lesson.type === "ASSIGNMENT" && (
        <AssignmentSubmit
          lessonId={lessonId}
          assignmentType={lesson.assignmentType}
          instructions={lesson.instructions}
          maxScore={lesson.maxScore}
          dueDate={lesson.dueDate?.toISOString() ?? null}
          allowLate={lesson.allowLate}
        />
      )}

      {/* SURVEY */}
      {lesson.type === "SURVEY" && (
        <SurveyView lessonId={lessonId} currentUserId={session.user.id} />
      )}

      {/* EBOOK */}
      {lesson.type === "EBOOK" && (
        <div className="space-y-4">
          {lesson.content ? (
            <div className="rounded-lg border border-border bg-background p-6 md:p-10">
              <div
                className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-serif"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            </div>
          ) : (
            <EmptyContent message="No ebook content has been written yet." />
          )}
        </div>
      )}

      {/* DISCUSSION */}
      {lesson.type === "DISCUSSION" && (
        <DiscussionThread
          lessonId={lessonId}
          currentUserId={session.user.id}
          discussionPrompt={lesson.discussionPrompt}
        />
      )}

      {/* SCORM */}
      {lesson.type === "SCORM" && (
        <div className="space-y-3">
          {lesson.scormPackageUrl ? (
            <>
              <div className="rounded-lg overflow-hidden border border-border bg-muted">
                <iframe
                  src={
                    lesson.scormEntryPoint
                      ? `${lesson.scormPackageUrl}/${lesson.scormEntryPoint}`
                      : lesson.scormPackageUrl
                  }
                  className="w-full"
                  style={{ height: "80vh" }}
                  allowFullScreen
                  title={lesson.title}
                />
              </div>
              {lesson.scormVersion && (
                <p className="text-xs text-muted-foreground">
                  SCORM {lesson.scormVersion} package
                </p>
              )}
            </>
          ) : (
            <EmptyContent message="No SCORM package has been uploaded yet." />
          )}
        </div>
      )}
    </div>
  );
}

// ── Shared sub-components ───────────────────────────────────────────

function EmptyContent({ message }: { message: string }) {
  return <EmptyState icon={FileIcon} title={message} />;
}

function LiveSessionContent({
  meetingUrl,
  meetingPlatform,
  scheduledAt,
  duration,
  recordingUrl,
  title,
}: {
  meetingUrl: string | null;
  meetingPlatform: string | null;
  scheduledAt: Date | null;
  duration: number | null;
  recordingUrl: string | null;
  title: string;
}) {
  const now = new Date();
  const sessionDate = scheduledAt ? new Date(scheduledAt) : null;
  const isUpcoming = sessionDate ? sessionDate > now : false;
  const isPast = sessionDate
    ? sessionDate.getTime() + (duration ?? 3600) * 1000 < now.getTime()
    : false;

  const platformLabel =
    meetingPlatform === "zoom"
      ? "Zoom"
      : meetingPlatform === "google_meet"
        ? "Google Meet"
        : meetingPlatform === "teams"
          ? "Microsoft Teams"
          : meetingPlatform === "webex"
            ? "Webex"
            : meetingPlatform ?? "Meeting";

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-6 space-y-4">
        {/* Session info */}
        <div className="flex items-start gap-4">
          <div className="size-14 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
            <RadioIcon className="size-7 text-pink-600 dark:text-pink-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{platformLabel}</p>
            {sessionDate && (
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className="flex items-center gap-1 text-muted-foreground tabular-nums">
                  <CalendarIcon className="size-3.5" />
                  {sessionDate.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <ClockIcon className="size-3.5" />
                  {sessionDate.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {duration && ` (${Math.round(duration / 60)} min)`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status + action */}
        {isUpcoming && (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 flex items-center gap-2">
            <ClockIcon className="size-4 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              This session hasn&apos;t started yet.
              {sessionDate && (
                <> Starts {sessionDate.toLocaleDateString()}.</>
              )}
            </p>
          </div>
        )}

        {meetingUrl && !isPast && (
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-(--dur-feedback) ease-(--ease-out-quart)"
          >
            <ExternalLinkIcon className="size-4" />
            Join {platformLabel}
          </a>
        )}
      </div>

      {/* Recording */}
      {recordingUrl && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
          <p className="text-sm font-medium">Session Recording</p>
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <iframe
              src={recordingUrl}
              className="w-full h-full"
              allowFullScreen
              title={`${title} - Recording`}
            />
          </div>
        </div>
      )}

      {isPast && !recordingUrl && (
        <div className="rounded-lg bg-muted/50 border border-border p-3 text-center">
          <p className="text-sm text-muted-foreground">
            This session has ended. No recording is available yet.
          </p>
        </div>
      )}
    </div>
  );
}
