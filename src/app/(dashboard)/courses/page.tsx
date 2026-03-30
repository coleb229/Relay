import { prisma } from "@/lib/prisma";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { CourseManager } from "@/components/course-manager/CourseManager";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";
import { PageHeader } from "@/components/ui/page-header";

export default async function CoursesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });

  // ── Student view: learner catalog ─────────────────────────────────
  if (session.user.role === "STUDENT") {
    const [coursesResult, totalCount] = await Promise.all([
      prisma.course.findMany({
        where: { status: "PUBLISHED" },
        take: 20,
        orderBy: { updatedAt: "desc" },
        include: {
          instructor: { select: { id: true, name: true, email: true, image: true } },
          category: true,
          _count: { select: { enrollments: true } },
          enrollments: {
            where: { userId: session.user.id },
            select: { id: true, status: true, _count: { select: { progress: true } } },
            take: 1,
          },
          modules: {
            select: {
              lessons: {
                where: { isPublished: true },
                select: { id: true },
              },
            },
          },
        },
      }),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
    ]);

    const courses = coursesResult.map((course) => {
      const enrollment = course.enrollments[0];
      const publishedLessonCount = course.modules.reduce(
        (sum, m) => sum + m.lessons.length,
        0
      );
      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        imageUrl: course.imageUrl,
        price: course.price,
        category: course.category,
        instructor: { name: course.instructor.name, image: course.instructor.image },
        _count: course._count,
        enrollment: enrollment
          ? { id: enrollment.id, status: enrollment.status, progressCount: enrollment._count.progress, totalLessons: publishedLessonCount }
          : null,
        publishedLessonCount,
      };
    });

    return (
      <CatalogBrowser
        initialCourses={courses}
        initialTotalCount={totalCount}
        categories={categories}
        userId={session.user.id}
      />
    );
  }

  // ── Admin/Instructor view: course manager ─────────────────────────
  const [coursesResult, totalCount] = await Promise.all([
    prisma.course.findMany({
      take: 20,
      orderBy: { updatedAt: "desc" },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        category: true,
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.course.count(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Courses" description="Manage and organize your course catalog" />
      <CourseManager
        initialCourses={coursesResult}
        initialTotalCount={totalCount}
        categories={categories}
        session={session}
      />
    </div>
  );
}
