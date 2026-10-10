import { SkeletonProductCard } from "@/components/shop/SkeletonProductCard";

export default function ShopLoading() {
  return (
    <div className="container-zed py-10 lg:py-14">
      <div className="mb-8 space-y-3">
        <div className="skeleton h-4 w-32 rounded-full" />
        <div className="skeleton h-8 w-64 rounded-full" />
        <div className="skeleton h-4 w-96 max-w-full rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonProductCard key={i} />
        ))}
      </div>
    </div>
  );
}
