"use client";

import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { getGradient, formatPrice } from "@/lib/course-utils";
import { Progress } from "@/components/ui/progress";

interface CatalogCardProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    price: number | null;
    category: { id: string; name: string; color: string | null } | null;
    instructor: { name: string | null; image: string | null };
    _count: { enrollments: number };
  };
  enrollment?: {
    id: string;
    status: string;
    progressCount: number;
    totalLessons: number;
  } | null;
}

export function CatalogCard({ course, enrollment }: CatalogCardProps) {
  const gradient = getGradient(course.title);
  const progressPercent =
    enrollment && enrollment.totalLessons > 0
      ? Math.round((enrollment.progressCount / enrollment.totalLessons) * 100)
      : 0;

  return (
    <Link
      href={`/courses/${course.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10 transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
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
              "flex h-full w-full items-center justify-center bg-linear-to-br",
              gradient
            )}
          >
            <span className="text-3xl font-bold text-white/30">
              {course.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Category chip (always visible) */}
        {course.category && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-white">
              <span
                className="size-2 rounded-full shrink-0"
                style={{
                  backgroundColor: course.category.color ?? "#8b5cf6",
                }}
              />
              {course.category.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug">
          {course.title}
        </h3>
        {course.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {course.description}
          </p>
        )}

        {/* Instructor */}
        <div className="mt-3 flex items-center gap-2">
          {course.instructor.image ? (
            <Image
              src={course.instructor.image}
              alt={course.instructor.name ?? "Instructor"}
              width={20}
              height={20}
              className="rounded-full"
            />
          ) : (
            <div className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
              {(course.instructor.name ?? "?").charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-xs text-muted-foreground truncate">
            {course.instructor.name ?? "Instructor"}
          </span>
        </div>

        {/* Bottom bar */}
        <div className="pt-4 border-t border-border/50 mt-auto">
          {enrollment ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {progressPercent}% complete
                </span>
                <span className="font-medium text-accent-foreground hover:underline">
                  Continue Learning &rarr;
                </span>
              </div>
              <Progress value={progressPercent} />
            </div>
          ) : (
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">
                {formatPrice(course.price)}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="size-3.5" />
                {course._count.enrollments}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export type { CatalogCardProps };
