import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border p-6 space-y-4">
        <Skeleton className="h-5 w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-6 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
