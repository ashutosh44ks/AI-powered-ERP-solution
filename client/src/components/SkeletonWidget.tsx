import { Skeleton } from "./ui/skeleton";

const SkeletonWidget = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center gap-4">
        <Skeleton className="rounded-full h-64 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  );
};

export default SkeletonWidget;
