"use client";

import { CourseCard } from "./CourseCard";

type Course = React.ComponentProps<typeof CourseCard>["course"];

interface CourseGridProps {
  courses: Course[];
  selectedIds: Set<string>;
  selectionMode: boolean;
  onSelect: (id: string) => void;
}

export function CourseGrid({
  courses,
  selectedIds,
  selectionMode,
  onSelect,
}: CourseGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          selected={selectedIds.has(course.id)}
          selectionMode={selectionMode}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
