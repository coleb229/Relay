import { Skeleton } from "@/components/ui/skeleton";

export default function EnrollmentsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-4 w-56 mt-2" />
      </div>
      <div className="rounded-xl border border-border">
        <div className="p-4 border-b border-border flex gap-6">
          {["w-24", "w-32", "w-16", "w-20", "w-20", "w-24"].map((w, i) => (
            <Skeleton key={i} className={`h-4 ${w}`} />
          ))}
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-border last:border-0 flex gap-6">
            {["w-28", "w-36", "w-16", "w-20", "w-20", "w-20"].map((w, j) => (
              <Skeleton key={j} className={`h-4 ${w}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
