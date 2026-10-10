"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Star, ShoppingBag, Heart, Truck, ShieldCheck } from "lucide-react";
import { formatKES, discountPercent } from "@/lib/utils";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { WishlistButton } from "@/components/product/WishlistButton";

type QuickViewProduct = {
  id: string;
  slug: string;
  name: string;
  headline?: string | null;
  price: number;
  compareAtPrice?: number | null;
  shortDescription?: string | null;
  images: { url: string; alt?: string | null }[];
  ratingAverage: number;
  ratingCount: number;
  trackInventory: boolean;
  quantity: number;
  reservedQuantity: number;
  personalizationEnabled: boolean;
  categories: { category: { name: string; slug: string } }[];
};

export function QuickView({ product, onClose }: { product: QuickViewProduct; onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const sale = discountPercent(product.price, product.compareAtPrice);
  const inStock = !product.trackInventory || product.quantity > product.reservedQuantity;
  const totalStock = product.quantity - product.reservedQuantity;

  return (
    <div
      className={`fixed inset-0 z-[90] flex items-center justify-center p-4 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.name}`}
    >
      <div className="absolute inset-0 bg-obsidian/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-zed bg-white shadow-drawer transition-all duration-300 ${visible ? "translate-y-0 scale-100" : "translate-y-4 scale-95"}`}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-white/80 text-black shadow-md backdrop-blur transition-colors hover:bg-white"
          aria-label="Close quick view"
        >
          <X className="size-5" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square bg-panel/50">
            {product.images[0]?.url ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt ?? product.name}
                fill
                sizes="(min-width:768px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="grid h-full place-items-center font-display text-4xl text-soft-sage">ZED</div>
            )}
            {sale != null && sale > 0 && (
              <span className="absolute left-4 top-4 rounded-full bg-zed-950 px-3 py-1.5 text-xs font-bold text-white">
                −{sale}%
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col p-6 md:p-8">
            <div className="flex flex-wrap gap-2">
              {product.categories.slice(0, 2).map((c) => (
                <Link
                  key={c.category.slug}
                  href={`/gifts/${c.category.slug}`}
                  onClick={onClose}
                  className="rounded-full bg-warm-white px-3 py-1 text-[11px] font-semibold text-deep-olive hover:bg-zed-950 hover:text-white"
                >
                  {c.category.name}
                </Link>
              ))}
            </div>

            <h2 className="mt-3 font-display text-2xl font-bold text-black">{product.name}</h2>
            {product.headline && <p className="mt-1 text-sm text-soft-sage">{product.headline}</p>}

            {product.ratingCount > 0 && (
              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`size-3.5 ${s <= Math.round(product.ratingAverage) ? "fill-zed-950 text-white" : "text-black/25"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-black/55">
                  {product.ratingAverage.toFixed(1)} ({product.ratingCount})
                </span>
              </div>
            )}

            <div className="mt-4 flex items-baseline gap-3">
              <p className="font-display text-3xl font-black text-black">{formatKES(product.price)}</p>
              {product.compareAtPrice != null && product.compareAtPrice > product.price && (
                <p className="text-lg text-black/40 line-through">{formatKES(product.compareAtPrice)}</p>
              )}
            </div>

            <p className="mt-1 text-sm">
              {inStock ? (
                <span className="font-semibold text-soft-sage">
                  In stock{totalStock <= 5 ? ` — only ${totalStock} left` : ""}
                </span>
              ) : (
                <span className="font-semibold text-red-600">Out of stock</span>
              )}
            </p>

            {product.shortDescription && (
              <p className="mt-4 text-sm leading-relaxed text-black/70">{product.shortDescription}</p>
            )}

            <div className="mt-6 flex items-center gap-3">
              {inStock && !product.personalizationEnabled && (
                <AddToCartButton productId={product.id} label="Add to Cart" />
              )}
              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-zed-950 px-5 py-3 text-sm font-bold text-white shadow-raised transition-all hover:-translate-y-0.5 hover:shadow-glass-lg"
              >
                <ShoppingBag className="size-4" />
                {product.personalizationEnabled ? "Personalize" : "View Details"}
              </Link>
              <WishlistButton productId={product.id} />
            </div>

            <div className="mt-6 space-y-2 border-t border-edge pt-4">
              <div className="flex items-center gap-2 text-xs text-black/60">
                <Truck className="size-4 text-soft-sage" />
                Same-day Nairobi delivery, 1–3 days countrywide
              </div>
              <div className="flex items-center gap-2 text-xs text-black/60">
                <ShieldCheck className="size-4 text-soft-sage" />
                Secure M-PESA, card & bank transfer payment
              </div>
              <div className="flex items-center gap-2 text-xs text-black/60">
                <Heart className="size-4 text-soft-sage" />
                Free gift wrapping available
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
