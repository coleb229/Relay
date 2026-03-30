import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "../../../../../../auth";
import { CourseBuilder } from "@/components/course-builder/CourseBuilder";
import type { CourseData, ModuleData, CategoryData } from "@/components/course-builder/types";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}

export default async function CourseEditPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "INSTRUCTOR") {
    redirect("/");
  }

  const [{ id }, { new: isNew }] = await Promise.all([params, searchParams]);

  const [course, categories] = await Promise.all([
    prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: { orderBy: { order: "asc" } },
          },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true, color: true },
    }),
  ]);

  if (!course) notFound();

  const courseData: CourseData = {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    imageUrl: course.imageUrl,
    status: course.status,
    price: course.price,
    tags: course.tags,
    instructorId: course.instructorId,
    categoryId: course.categoryId,
    compareAtPrice: course.compareAtPrice,
    pricingType: course.pricingType,
    landingPageSections: course.landingPageSections as unknown[] | null,
  };

  const modulesData: ModuleData[] = course.modules.map((mod) => ({
    id: mod.id,
    courseId: mod.courseId,
    title: mod.title,
    description: mod.description,
    order: mod.order,
    lessons: mod.lessons.map((lesson) => ({
      id: lesson.id,
      moduleId: lesson.moduleId,
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      order: lesson.order,
      duration: lesson.duration,
      type: lesson.type,
      isPublished: lesson.isPublished,
      fileUrl: lesson.fileUrl,
      fileName: lesson.fileName,
      fileSize: lesson.fileSize,
      audioUrl: lesson.audioUrl,
      embedCode: lesson.embedCode,
      meetingUrl: lesson.meetingUrl,
      meetingPlatform: lesson.meetingPlatform,
      scheduledAt: lesson.scheduledAt?.toISOString() ?? null,
      recordingUrl: lesson.recordingUrl,
      assignmentType: lesson.assignmentType,
      maxScore: lesson.maxScore,
      dueDate: lesson.dueDate?.toISOString() ?? null,
      allowLate: lesson.allowLate,
      instructions: lesson.instructions,
      scormPackageUrl: lesson.scormPackageUrl,
      scormVersion: lesson.scormVersion,
      scormEntryPoint: lesson.scormEntryPoint,
      discussionPrompt: lesson.discussionPrompt,
    })),
  }));

  return (
    <div className="flex flex-col h-full -m-6">
      <CourseBuilder
        course={courseData}
        initialModules={modulesData}
        categories={categories}
        redirectAfterSave={isNew === "1" ? "/courses" : `/courses/${courseData.id}`}
      />
    </div>
  );
}
