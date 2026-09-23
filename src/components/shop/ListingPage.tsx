import "server-only";

import { Suspense } from "react";
import { listProducts, type ProductListFilters } from "@/lib/data/products";
import { listCategories } from "@/lib/data/catalog";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ShopControls } from "@/components/shop/ShopControls";
import { Pagination } from "@/components/shop/Pagination";

const SORT_LABELS: Record<string, string> = {
  featured: "Featured",
  new: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Top rated",
  name: "Name Aâ€“Z",
};

export async function ListingPage({
  title,
  eyebrow,
  description,
  filters,
  href,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  filters: ProductListFilters;
  href: string;
}) {
  const [result, allCategories] = await Promise.all([
    listProducts(filters),
    listCategories(),
  ]);

  const occasions = allCategories.filter((c) => c.kind === "OCCASION").map((c) => ({ slug: c.slug, name: c.name, count: c._count.products }));
  const recipients = allCategories.filter((c) => c.kind === "RECIPIENT").map((c) => ({ slug: c.slug, name: c.name, count: c._count.products }));
  const categories = allCategories.filter((c) => c.kind === "CATEGORY").map((c) => ({ slug: c.slug, name: c.name, count: c._count.products }));

  return (
    <div className="container-zed py-10 lg:py-14">
      <header className="mb-8 max-w-2xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 font-display text-3xl font-bold text-black lg:text-4xl">{title}</h1>
        {description ? <p className="mt-3 leading-relaxed text-black/70">{description}</p> : null}
        <p className="mt-3 text-sm text-black/50">
          {result.total} gift{result.total === 1 ? "" : "s"} available
        </p>
      </header>

      <div className="flex gap-8">
        <Suspense fallback={null}>
          <ShopControls
            categories={categories}
            occasions={occasions}
            recipients={recipients}
            minPrice={result.minPrice}
            maxPrice={result.maxPrice}
            sortLabels={SORT_LABELS}
          />
        </Suspense>

        <div className="min-w-0 flex-1">
          <ProductGrid products={result.items} />
          <Pagination page={result.page} pages={result.pages} total={result.total} pageSize={result.pageSize} href={href} />
        </div>
      </div>
    </div>
  );
}