"use client";

import { CatalogCard, type CatalogCardProps } from "./CatalogCard";

interface CatalogGridProps {
  courses: CatalogCardProps["course"][];
  enrollments: Map<string, CatalogCardProps["enrollment"]>;
}

export function CatalogGrid({ courses, enrollments }: CatalogGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CatalogCard
          key={course.id}
          course={course}
          enrollment={enrollments.get(course.id)}
        />
      ))}
    </div>
  );
}
