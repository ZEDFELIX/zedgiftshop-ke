import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-zed flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="glass-card rounded-zed p-10 md:p-16">
        <p className="font-display text-7xl font-black text-deep-olive/20">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-black md:text-3xl">Page not found</h1>
        <p className="mx-auto mt-3 max-w-md text-black/60">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back to shopping.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-zed-950 px-6 py-3 text-sm font-bold text-white shadow-raised transition-all hover:-translate-y-0.5 hover:shadow-glass-lg"
          >
            <ShoppingBag className="size-4" />
            Browse Gifts
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-full border border-edge bg-white/60 px-6 py-3 text-sm font-bold text-black backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white"
          >
            <Search className="size-4" />
            Search
          </Link>
        </div>
      </div>
    </div>
  );
}
