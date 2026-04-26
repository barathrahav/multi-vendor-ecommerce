import type { ReactNode } from "react";

type SkeletonProps = {
  className?: string;
  children?: ReactNode;
};

const Skeleton = ({ className = "", children }: SkeletonProps) => {
  return (
    <div
      className={`shimmer overflow-hidden rounded-2xl bg-slate-200/80 ${className}`}
      aria-hidden="true"
    >
      {children}
    </div>
  );
};

export default Skeleton;
