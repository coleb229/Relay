import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-56 mt-2" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-28" />
          </div>
        ))}
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
      <div>
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="rounded-xl border border-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 border-b border-border last:border-0 flex gap-6">
              {["w-28", "w-36", "w-20", "w-16", "w-20"].map((w, j) => (
                <Skeleton key={j} className={`h-4 ${w}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
