import "server-only";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, Star } from "lucide-react";
import type { ProductWithRelations } from "@/lib/data/products";
import { discountPercent, formatKES } from "@/lib/utils";
import { WishlistButton } from "@/components/product/WishlistButton";
import { AddToCartButton } from "@/components/product/AddToCartButton";

export function ProductCard({ product, inWishlist = false }: { product: ProductWithRelations; inWishlist?: boolean }) {
  const image = product.images[0]?.url;
  const sale = discountPercent(product.price, product.compareAtPrice);
  const inStock = !product.trackInventory || product.quantity > product.reservedQuantity;
  const personalizable = product.personalizationEnabled;
  const canQuickAdd = inStock && !personalizable;

  const isNew = product.tags.some((t) => t.toLowerCase() === "new");
  const isPopular = product.ratingCount >= 5;

  const badge = !inStock
    ? { label: "Out of stock", cls: "bg-ink/85 text-white" }
    : personalizable && !sale
      ? { label: "Personalize", cls: "bg-panel/90 text-deep-olive backdrop-blur" }
      : sale != null && sale > 0
        ? { label: `SALE −${sale}%`, cls: "bg-zed-950 text-white" }
        : isNew
          ? { label: "NEW", cls: "bg-zed-950 text-white" }
          : isPopular
            ? { label: "POPULAR", cls: "bg-panel/90 text-black backdrop-blur" }
            : null;

  return (
    <article className="group glass-card relative flex h-full flex-col rounded-[1.6rem] p-2.5">
      <div className="relative overflow-hidden rounded-[1.35rem] bg-panel/65">
        <Link href={`/product/${product.slug}`} className="block aspect-square" aria-label={product.name}>
          {image ? (
            <Image
              src={image}
              alt={product.images[0]?.alt ?? product.name}
              fill
              sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
              unoptimized
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <span className="grid aspect-square place-items-center font-display text-3xl text-deep-olive">ZED</span>
          )}
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {badge && (
          <span className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-glass ${badge.cls}`}>
            {badge.label}
          </span>
        )}

        <div className="absolute right-2.5 top-2.5">
          <WishlistButton productId={product.id} initialInWishlist={inWishlist} />
        </div>

        <div className="absolute inset-x-2.5 bottom-2.5 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {canQuickAdd ? (
            <AddToCartButton productId={product.id} label="Quick add" />
          ) : (
            <Link
              href={`/product/${product.slug}`}
              className="block rounded-full border border-white/60 bg-white/85 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-black backdrop-blur-sm transition-colors hover:bg-zed-950 hover:text-white"
            >
              {personalizable ? "Personalize" : "View details"}
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1.5 pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-soft-sage">
            {product.categories[0]?.category.name ?? "Gift"}
          </p>
          {product.ratingCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-black/70">
              <Star className="size-3.5 fill-zed-950 text-white" />
              {product.ratingAverage.toFixed(1)}
              <span className="text-black/40">({product.ratingCount})</span>
            </span>
          )}
        </div>
        <h3 className="mt-1.5">
          <Link href={`/product/${product.slug}`} className="font-display text-[15px] font-semibold leading-snug text-black hover:text-soft-sage">
            {product.name}
          </Link>
        </h3>
        {product.shortDescription && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-black/55">{product.shortDescription}</p>
        )}
        <div className="mt-auto flex items-baseline justify-between gap-2 pt-2.5">
          <div className="flex items-baseline gap-2">
            <p className="text-[15px] font-bold text-black">{formatKES(product.price)}</p>
            {product.compareAtPrice != null && product.compareAtPrice > product.price && (
              <p className="text-sm text-black/40 line-through">{formatKES(product.compareAtPrice)}</p>
            )}
          </div>
          {personalizable && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-soft-sage">
              <Sparkles className="size-3" /> Personalize
            </span>
          )}
        </div>
      </div>
    </article>
  );
}