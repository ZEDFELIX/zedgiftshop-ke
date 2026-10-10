export default function ProductLoading() {
  return (
    <div className="container-zed py-8 lg:py-12">
      <div className="skeleton mb-6 h-4 w-64 rounded-full" />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="space-y-3">
          <div className="skeleton aspect-square rounded-zed" />
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton aspect-square rounded-zed" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="skeleton h-6 w-32 rounded-full" />
          <div className="skeleton h-10 w-full rounded-full" />
          <div className="skeleton h-4 w-48 rounded-full" />
          <div className="skeleton h-12 w-40 rounded-full" />
          <div className="skeleton h-24 w-full rounded-zed" />
          <div className="skeleton h-14 w-full rounded-zed" />
        </div>
      </div>
    </div>
  );
}
