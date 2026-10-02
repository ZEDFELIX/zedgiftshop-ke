import Link from "next/link";
import { getCategoryFacets } from "@/lib/data/products";
import Image from "next/image";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "Collections & Categories",
  description: "Browse gifts by category, occasion, and recipient",
};

export default async function CollectionsPage() {
  const categories = await getCategoryFacets("CATEGORY");

  return (
    <div className="container-zed py-10 lg:py-14">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-black lg:text-4xl">Collections & Categories</h1>
        <p className="mt-3 text-sm text-black/50">
          {categories.length} categories available
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
          <Link href="/collections/gourmet" className="group rounded-xl bg-white/80 p-4 hover:bg-white/90 transition-colors">
            <span className="absolute top-2 right-2 rounded-full bg-zed-950 text-xs text-white px-2">Gourmet</span>
            <h4 className="font-display text-base font-medium text-black hover:text-zed-950 transition-colors">Gourmet Gifts</h4>
            <p className="mt-2 text-sm text-black/60">Premium food & delivery</p>
          </Link>
          <Link href="/collections/corporate" className="group rounded-xl bg-white/80 p-4 hover:bg-white/90 transition-colors">
            <span className="absolute top-2 right-2 rounded-full bg-zed-950 text-xs text-white px-2">Corporate</span>
            <h4 className="font-display text-base font-medium text-black hover:text-zed-950 transition-colors">Corporate Gifts</h4>
            <p className="mt-2 text-sm text-black/60">Bulk & personalized</p>
          </Link>
          <Link href="/collections/gifts" className="group rounded-xl bg-white/80 p-4 hover:bg-white/90 transition-colors">
            <span className="absolute top-2 right-2 rounded-full bg-zed-950 text-xs text-white px-2">Gifts</span>
            <h4 className="font-display text-base font-medium text-black hover:text-zed-950 transition-colors">Occasion Gifts</h4>
            <p className="mt-2 text-sm text-black/60">For every moment</p>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/collections?category=${category.slug}`}
            className="glass-card rounded-2xl p-5 text-left transition-colors hover:bg-white/80 hover:text-charcoal"
          >
            <div className="h-20 rounded-2xl overflow-hidden mb-3">
              <Image
                src={`https://picsum.photos/seed/${category.slug}/400/400`}
                alt={category.name}
                fill
                className="object-cover"
              />
            </div>
            <h3 className="font-display text-[13px] font-semibold text-charcoal line-clamp-2">
              {category.name}
            </h3>
            <p className="mt-2 text-sm text-black/60">{category._count.products} gifts</p>
          </Link>
        ))}
      </div>
    </div>
  );
}