import "server-only";

import { ProductCard } from "@/components/product/ProductCard";
import type { ProductWithRelations } from "@/lib/data/products";

export function ProductGrid({ products, wishlistIds = [] }: { products: ProductWithRelations[]; wishlistIds?: string[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-edge-strong px-6 py-16 text-center">
        <p className="font-display text-lg font-bold text-black">No gifts match your filters</p>
        <p className="mt-1 text-sm text-black/60">Try adjusting your search or browse all gifts instead.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} inWishlist={wishlistIds.includes(product.id)} />
      ))}
    </div>
  );
}