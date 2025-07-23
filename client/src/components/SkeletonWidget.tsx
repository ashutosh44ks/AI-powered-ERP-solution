import { Skeleton } from "./ui/skeleton";

const SkeletonWidget = () => {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-4 w-48" />
    </div>
  );
};

export default SkeletonWidget;
