import Skeleton from "../../../components/common/Skeleton";

const CartPageSkeleton = () => {
  return (
    <div className="space-y-8">
      <Skeleton className="h-48 w-full rounded-[2rem]" />

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <article
              key={index}
              className="flex flex-col gap-4 rounded-[1.5rem] border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-2xl" />
                <div className="space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-32 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-xl" />
              </div>
            </article>
          ))}
        </section>

        <Skeleton className="h-80 w-full rounded-[1.5rem]" />
      </div>
    </div>
  );
};

export default CartPageSkeleton;
