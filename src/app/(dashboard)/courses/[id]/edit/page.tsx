import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "../../../../../../auth";
import { CourseBuilder } from "@/components/course-builder/CourseBuilder";
import type { CourseData, ModuleData } from "@/components/course-builder/types";

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

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
    },
  });

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
    })),
  }));

  return (
    <div className="flex flex-col h-full -m-6">
      <CourseBuilder
        course={courseData}
        initialModules={modulesData}
        redirectAfterSave={isNew === "1" ? "/courses" : `/courses/${courseData.id}`}
      />
    </div>
  );
}
