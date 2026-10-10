import "server-only";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, Star, Eye } from "lucide-react";
import type { ProductWithRelations } from "@/lib/data/products";
import { discountPercent, formatKES } from "@/lib/utils";
import { WishlistButton } from "@/components/product/WishlistButton";
import { AddToCartButton } from "@/components/product/AddToCartButton";

export function ProductCard({
  product,
  inWishlist = false,
  onQuickView,
}: {
  product: ProductWithRelations;
  inWishlist?: boolean;
  onQuickView?: (product: ProductWithRelations) => void;
}) {
  const image = product.images[0]?.url;
  const sale = discountPercent(product.price, product.compareAtPrice);
  const inStock = !product.trackInventory || product.quantity > product.reservedQuantity;
  const personalizable = product.personalizationEnabled;
  const canQuickAdd = inStock && !personalizable;
  const totalStock = product.quantity - product.reservedQuantity;
  const lowStock = inStock && product.trackInventory && totalStock <= 5;

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
    <article className="group rounded-xl bg-white/55 p-3 transition-all duration-300 hover:translate-y-0.5 hover:shadow-glass-md">
      <div className="relative rounded-t-xl bg-panel/65 overflow-hidden h-48">
        <Link href={`/product/${product.slug}`} className="block" aria-label={`View ${product.name}`}>
          {image ? (
            <Image
              src={image}
              alt={product.images[0]?.alt ?? product.name}
              fill
              sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 ease-out hover:scale-[1.05]"
            />
          ) : (
            <span className="grid aspect-[4/3] place-items-center font-display text-2xl text-deep-olive">ZED</span>
          )}
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {badge && (
          <span className={`absolute left-2 top-2 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider shadow-glass ${badge.cls}`}>
            {badge.label}
          </span>
        )}

        <div className="absolute right-2 top-2">
          <WishlistButton productId={product.id} initialInWishlist={inWishlist} />
        </div>

        {lowStock && (
          <span className="absolute left-2 bottom-2 rounded-full bg-amber-500/90 px-2 py-0.5 text-[8px] font-bold text-white">
            Only {totalStock} left
          </span>
        )}

        <div className="absolute left-2 bottom-2 right-2 flex gap-1.5 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {canQuickAdd && (
            <AddToCartButton productId={product.id} label="Add" />
          )}
          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="grid size-8 shrink-0 place-items-center rounded-full bg-white/80 text-black backdrop-blur-sm transition-colors hover:bg-zed-950 hover:text-white"
              aria-label={`Quick view ${product.name}`}
            >
              <Eye className="size-3.5" />
            </button>
          )}
          <Link
            href={`/product/${product.slug}`}
            className="flex flex-1 items-center justify-center rounded-full border border-white/60 bg-white/80 px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-black backdrop-blur-sm transition-colors hover:bg-zed-950 hover:text-white"
            aria-label={personalizable ? `Personalize ${product.name}` : `View ${product.name}`}
          >
            {personalizable ? "Personalize" : "View"}
          </Link>
        </div>
      </div>

      <div className="p-2">
        <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-soft-sage">
          {product.categories[0]?.category.name ?? "Gift"}
        </p>
        {product.ratingCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-black/60">
            <Star className="size-2 fill-zed-950 text-white" /> {product.ratingAverage.toFixed(1)} ({product.ratingCount})
          </span>
        )}
        <h4 className="mt-1 text-[11px] font-display font-semibold leading-snug text-black hover:text-zed-950 transition-colors">
          {product.name}
        </h4>
        {product.shortDescription && (
          <p className="mt-0.5 text-[7px] text-black/55 line-clamp-1">{product.shortDescription}</p>
        )}
        <div className="mt-1 flex items-baseline justify-between">
          <p className="text-[11px] font-bold text-black">{formatKES(product.price)}</p>
          {product.compareAtPrice != null && product.compareAtPrice > product.price && (
            <p className="text-xs text-black/40 line-through">{formatKES(product.compareAtPrice)}</p>
          )}
          {personalizable && (
            <span className="flex items-center gap-0.5 text-[7px] font-medium text-soft-sage">
              <Sparkles className="size-2" /> Personalize
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
