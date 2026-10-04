export function PosterGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border/40 bg-card p-4 flex flex-col gap-4 animate-pulse"
        >
          {/* Image Placeholder */}
          <div className="aspect-[3/4] w-full rounded-xl bg-secondary/60" />

          {/* Lines */}
          <div className="flex flex-col gap-2">
            <div className="h-4 w-3/4 bg-secondary/80 rounded" />
            <div className="h-3 w-1/2 bg-secondary/60 rounded" />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <div className="h-5 w-16 bg-amber-500/20 rounded" />
            <div className="h-8 w-20 bg-secondary rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
