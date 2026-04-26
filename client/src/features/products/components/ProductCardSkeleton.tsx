import Skeleton from "../../../components/common/Skeleton";

const ProductCardSkeleton = () => {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border bg-white shadow-sm">
      <Skeleton className="h-56 w-full rounded-none" />
      <div className="space-y-4 p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
          <Skeleton className="h-8 w-28" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </article>
  );
};

export default ProductCardSkeleton;
