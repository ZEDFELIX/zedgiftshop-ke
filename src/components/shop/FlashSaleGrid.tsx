"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye } from "lucide-react";
import { formatKES } from "@/lib/utils";
import { QuickView } from "@/components/product/QuickView";
import type { ProductWithRelations } from "@/lib/data/products";

export function FlashSaleGrid({ products }: { products: ProductWithRelations[] }) {
  const [quickViewProduct, setQuickViewProduct] = useState<ProductWithRelations | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="rounded-xl bg-white/80 p-3 hover:bg-white/90 transition-colors">
            <div className="relative">
              {product.images[0]?.url ? (
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  width={400}
                  height={128}
                  className="rounded-zed h-32 object-cover mb-2"
                />
              ) : (
                <div className="rounded-zed h-32 bg-panel/60 mb-2" />
              )}
              <button
                onClick={() => setQuickViewProduct(product)}
                className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/80 text-black opacity-0 backdrop-blur-sm transition-opacity hover:bg-zed-950 hover:text-white group-hover:opacity-100"
                aria-label={`Quick view ${product.name}`}
              >
                <Eye className="size-3.5" />
              </button>
            </div>
            <p className="text-xs font-semibold text-black line-clamp-1">{product.name}</p>
            <p className="mt-1 text-[11px] line-through text-black/40">{formatKES(product.compareAtPrice ?? product.price)}</p>
            <p className="mt-1 text-[11px] font-bold text-zed-950">{formatKES(product.price)}</p>
          </div>
        ))}
      </div>
      {quickViewProduct && (
        <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </>
  );
}
