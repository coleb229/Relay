"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getGradient, formatPrice, STATUS_BADGE_VARIANT, STATUS_LABEL } from "@/lib/course-utils";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  price: number | null;
  category: { id: string; name: string; color: string | null } | null;
  instructor: { name: string | null; email: string | null };
  _count: { enrollments: number };
};

interface CourseListProps {
  courses: Course[];
  selectedIds: Set<string>;
  selectionMode: boolean;
  onSelect: (id: string) => void;
}

export function CourseList({
  courses,
  selectedIds,
  selectionMode,
  onSelect,
}: CourseListProps) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10" />
          <TableHead className="w-12" />
          <TableHead>Title</TableHead>
          <TableHead>Instructor</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Enrollments</TableHead>
          <TableHead className="text-right">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => {
          const gradient = getGradient(course.title);

          return (
            <TableRow
              key={course.id}
              className="cursor-pointer"
              data-state={selectedIds.has(course.id) ? "selected" : undefined}
              onClick={() => router.push(`/courses/${course.id}`)}
            >
              <TableCell
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={selectedIds.has(course.id)}
                  onCheckedChange={() => onSelect(course.id)}
                />
              </TableCell>
              <TableCell>
                <div className="size-10 overflow-hidden rounded">
                  {course.imageUrl ? (
                    <Image
                      src={course.imageUrl}
                      alt={course.title}
                      width={40}
                      height={40}
                      className="size-10 object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center bg-gradient-to-br text-xs font-bold text-white/80",
                        gradient
                      )}
                    >
                      {course.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">{course.title}</TableCell>
              <TableCell className="text-muted-foreground">
                {course.instructor.name ?? course.instructor.email ?? "---"}
              </TableCell>
              <TableCell>
                {course.category ? (
                  <Badge variant="outline">{course.category.name}</Badge>
                ) : (
                  <span className="text-muted-foreground">---</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_BADGE_VARIANT[course.status]}>
                  {STATUS_LABEL[course.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {course._count.enrollments}
              </TableCell>
              <TableCell className="text-right">
                {formatPrice(course.price)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
