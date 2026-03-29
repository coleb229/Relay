import { Skeleton } from "@/components/ui/skeleton";

export default function StudentsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 flex items-center gap-3">
            <Skeleton className="size-10 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border">
        <div className="p-4 border-b border-border flex gap-6">
          {["w-24", "w-40", "w-16", "w-20", "w-24"].map((w, i) => (
            <Skeleton key={i} className={`h-4 ${w}`} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-border last:border-0 flex gap-6">
            {["w-28", "w-44", "w-16", "w-12", "w-20"].map((w, j) => (
              <Skeleton key={j} className={`h-4 ${w}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
