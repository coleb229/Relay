import { cn } from "@/lib/utils";
import { GraduationCap } from "lucide-react";

interface InstructorBioSectionProps {
  instructor?: {
    name: string | null;
    image: string | null;
    bio: string | null;
    courseCount?: number;
  };
}

export function InstructorBioSection({ instructor }: InstructorBioSectionProps) {
  if (!instructor?.name) {
    return (
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">
          Meet Your Instructor
        </h2>
        <p className="text-muted-foreground">
          Instructor information is not available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6">
      <h2 className="mb-8 text-2xl font-semibold tracking-tight text-center">
        Meet Your Instructor
      </h2>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {instructor.image ? (
          <img
            src={instructor.image}
            alt={instructor.name}
            className="size-24 shrink-0 rounded-full object-cover shadow-md ring-2 ring-border"
          />
        ) : (
          <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-primary/10 shadow-md ring-2 ring-border">
            <GraduationCap className="size-10 text-primary" />
          </div>
        )}
        <div className={cn("flex-1", !instructor.image && "text-center sm:text-left")}>
          <h3 className="text-xl font-bold">{instructor.name}</h3>
          {instructor.courseCount !== undefined && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {instructor.courseCount} {instructor.courseCount === 1 ? "course" : "courses"}
            </p>
          )}
          {instructor.bio && (
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {instructor.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
