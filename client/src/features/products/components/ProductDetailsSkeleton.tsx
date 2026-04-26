import Skeleton from "../../../components/common/Skeleton";

const ProductDetailsSkeleton = () => {
  return (
    <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border bg-white shadow-sm">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-6 md:p-10">
          <Skeleton className="h-[440px] w-full rounded-[1.5rem]" />
        </div>

        <div className="space-y-6 p-6 md:p-10">
          <div className="flex gap-3">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-5 w-4/6" />

          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>

          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton;
