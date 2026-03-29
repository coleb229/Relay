"use client";

import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getGradient, formatPrice, STATUS_BADGE_VARIANT, STATUS_LABEL, DEFAULT_CATEGORY_COLOR } from "@/lib/course-utils";

interface CourseCardProps {
  course: {
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
  selected: boolean;
  selectionMode: boolean;
  onSelect: (id: string) => void;
}

export function CourseCard({
  course,
  selected,
  selectionMode,
  onSelect,
}: CourseCardProps) {
  const gradient = getGradient(course.title);

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10 transition-all duration-200 hover:shadow-xl hover:-translate-y-1",
        selected && "ring-2 ring-primary shadow-lg shadow-primary/10"
      )}
    >
      {/* Cover image */}
      <div className="relative aspect-video overflow-hidden">
        {course.imageUrl ? (
          <Image
            src={course.imageUrl}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center bg-gradient-to-br",
              gradient
            )}
          >
            <span className="text-3xl font-bold text-white/30">
              {course.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Status badge (top-left) */}
        <div className="absolute top-2.5 left-2.5">
          <Badge variant={STATUS_BADGE_VARIANT[course.status]} className="shadow-sm">
            {STATUS_LABEL[course.status]}
          </Badge>
        </div>

        {/* Category chip (bottom-left, over image) */}
        {course.category && (
          <div className="absolute bottom-2.5 left-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-white"
            >
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: course.category.color ?? DEFAULT_CATEGORY_COLOR }}
              />
              {course.category.name}
            </span>
          </div>
        )}

        {/* Checkbox (top-right) */}
        <div
          className={cn(
            "absolute top-2.5 right-2.5 transition-opacity",
            selectionMode ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          onClick={(e) => e.preventDefault()}
        >
          <Checkbox
            checked={selected}
            onCheckedChange={() => onSelect(course.id)}
            className="border-white bg-white/80 data-[checked]:bg-primary data-[checked]:border-primary shadow-sm"
          />
        </div>
      </div>

      {/* Content */}
      <Link
        href={`/courses/${course.id}`}
        className="flex flex-1 flex-col p-4"
      >
        <h3 className="line-clamp-2 font-semibold leading-snug">
          {course.title}
        </h3>
        {course.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {course.description}
          </p>
        )}

        {/* Bottom bar */}
        <div className="flex items-center justify-between pt-4 text-sm border-t border-border/50 mt-3">
          <span className="font-semibold">
            {formatPrice(course.price)}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="size-3.5" />
            {course._count.enrollments}
          </span>
        </div>
      </Link>
    </div>
  );
}
