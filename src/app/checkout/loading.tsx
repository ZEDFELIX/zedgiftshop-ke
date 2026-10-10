export default function CheckoutLoading() {
  return (
    <div className="container-zed py-10 lg:py-14">
      <div className="skeleton mb-8 h-8 w-48 rounded-full" />
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="skeleton h-40 rounded-zed" />
          <div className="skeleton h-40 rounded-zed" />
          <div className="skeleton h-40 rounded-zed" />
        </div>
        <div className="skeleton h-96 rounded-zed" />
      </div>
    </div>
  );
}
