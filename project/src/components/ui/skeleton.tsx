import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to animate the skeleton */
  animate?: boolean;
}

function Skeleton({
  className,
  animate = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted",
        animate && "animate-pulse",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  )
}

// Preset skeleton components for common use cases
function SkeletonText({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn("h-4 w-full", className)} {...props} />
}

function SkeletonTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn("h-6 w-3/4", className)} {...props} />
}

function SkeletonAvatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn("h-10 w-10 rounded-full", className)} {...props} />
}

function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-xl border bg-card p-6 space-y-4", className)} {...props}>
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading table data">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

function SkeletonRefereeCard() {
  return (
    <div className="rounded-xl border bg-card p-6" role="status" aria-label="Loading referee card">
      <div className="flex flex-col items-center space-y-4">
        <SkeletonAvatar className="h-20 w-20" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
        <div className="w-full space-y-2 pt-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

function SkeletonMatchCard() {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50"
      role="status"
      aria-label="Loading match data"
    >
      <Skeleton className="h-10 w-16" />
      <div className="flex-1 flex items-center gap-3">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-4 flex-1 max-w-[120px]" />
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 flex-1 max-w-[120px]" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

export {
  Skeleton,
  SkeletonText,
  SkeletonTitle,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTable,
  SkeletonRefereeCard,
  SkeletonMatchCard
}
