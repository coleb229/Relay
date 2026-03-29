import { BookOpen } from "lucide-react";

interface InstructorCardProps {
  instructor: {
    name: string | null;
    image: string | null;
    bio: string | null;
    courseCount: number;
  };
}

export function InstructorCard({ instructor }: InstructorCardProps) {
  return (
    <div className="flex items-start gap-4">
      {instructor.image ? (
        <img
          src={instructor.image}
          alt={instructor.name ?? "Instructor"}
          className="size-16 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="flex size-16 items-center justify-center rounded-full bg-muted text-lg font-semibold text-muted-foreground shrink-0">
          {(instructor.name ?? "?").charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{instructor.name ?? "Instructor"}</p>
        {instructor.bio && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
            {instructor.bio}
          </p>
        )}
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          <BookOpen className="size-3" />
          {instructor.courseCount} {instructor.courseCount === 1 ? "course" : "courses"}
        </div>
      </div>
    </div>
  );
}
