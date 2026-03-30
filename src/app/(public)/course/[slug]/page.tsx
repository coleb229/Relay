import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../auth";
import { CourseLanding } from "@/components/catalog/CourseLanding";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
    select: { title: true, description: true, imageUrl: true, status: true },
  });

  if (!course || course.status !== "PUBLISHED") return {};

  return {
    title: course.title,
    description: course.description || undefined,
    openGraph: {
      title: course.title,
      description: course.description || undefined,
      ...(course.imageUrl ? { images: [course.imageUrl] } : {}),
    },
  };
}

export default async function PublicCoursePage({ params }: PageProps) {
  const [{ slug }, session] = await Promise.all([params, auth()]);

  const course = await prisma.course.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      imageUrl: true,
      price: true,
      compareAtPrice: true,
      tags: true,
      status: true,
      landingPageSections: true,
      instructor: {
        select: { id: true, name: true, image: true, bio: true },
      },
      category: { select: { name: true, color: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) notFound();

  // Admins/instructors can preview any status; public visitors only see PUBLISHED
  const isStaff =
    session?.user.role === "ADMIN" || session?.user.role === "INSTRUCTOR";
  if (course.status !== "PUBLISHED" && !isStaff) {
    notFound();
  }

  const instructorCourseCount = await prisma.course.count({
    where: { instructorId: course.instructor.id, status: "PUBLISHED" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <CourseLanding
        course={{
          ...course,
          landingPageSections: course.landingPageSections as unknown[] | null,
        }}
        enrollment={null}
        instructorCourseCount={instructorCourseCount}
        isPublic
      />
    </div>
  );
}
