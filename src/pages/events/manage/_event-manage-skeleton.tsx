import { Skeleton } from "@/components/ui/skeleton";

export function EventManageSkeleton() {
  return (
    <div className="p-3 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="h-6 w-48 rounded-lg" />
      </div>
      <div className="bg-surface-card rounded-2xl p-5 border border-neon-cyan/20">
        <Skeleton className="h-5 w-32 rounded-lg mb-3" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
      <div className="bg-surface-card rounded-2xl p-5 border border-neon-cyan/20">
        <Skeleton className="h-5 w-36 rounded-lg mb-3" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
