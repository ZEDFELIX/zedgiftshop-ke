import "server-only";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Quote, ShieldCheck, Star, Truck } from "lucide-react";
import { getProductBySlug, getRelatedProducts, productSeoTitle } from "@/lib/data/products";
import { listApprovedReviews, ratingBreakdown } from "@/lib/data/reviews";
import { buildMetadata, jsonLdBreadcrumb, jsonLdProduct } from "@/lib/seo";
import { discountPercent, formatKES } from "@/lib/utils";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { ReviewForm } from "@/components/product/ReviewForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return buildMetadata({
    title: productSeoTitle(product),
    description: product.shortDescription ?? product.description ?? undefined,
    path: `/product/${slug}`,
    image: product.images[0]?.url ?? undefined,
    type: "article",
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, wrapOptions, related, categories] = await Promise.all([
    listApprovedReviews(product.id),
    prisma.giftWrap.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    getRelatedProducts(product.id, product.categories.map((c) => c.categoryId)),
    Promise.resolve(product.categories.map((c) => c.category)),
  ]);

  const breakdown = ratingBreakdown(reviews);
  const sale = discountPercent(product.price, product.compareAtPrice);
  const inStock = !product.trackInventory || product.quantity > product.reservedQuantity;
  const totalStock = product.quantity - product.reservedQuantity;
  const personalizationFields = product.personalizationFieldsJson
    ? (JSON.parse(product.personalizationFieldsJson) as { key: string; label: string; type: string; required?: boolean; maxLength?: number }[])
    : [];

  const breadcrumb = jsonLdBreadcrumb([
    { name: "Shop", path: "/shop" },
    ...(categories[0] ? [{ name: categories[0].name, path: `/gifts/${categories[0].slug}` }] : []),
    { name: product.name, path: `/product/${product.slug}` },
  ]);

  const productJsonLd = jsonLdProduct({
    name: product.name,
    description: product.description,
    image: product.images[0]?.url,
    price: product.price,
    sku: product.sku,
    availability: inStock ? "in" : "out",
  });

  return (
    <div className="container-zed py-8 lg:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 overflow-x-auto text-xs text-ink/55">
        <Link href="/" className="hover:text-deep-olive">Home</Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <Link href="/shop" className="hover:text-deep-olive">Shop</Link>
        {categories[0] && (
          <>
            <ChevronRight className="size-3.5 shrink-0" />
            <Link href={`/gifts/${categories[0].slug}`} className="whitespace-nowrap hover:text-deep-olive">
              {categories[0].name}
            </Link>
          </>
        )}
        <ChevronRight className="size-3.5 shrink-0" />
        <span className="whitespace-nowrap text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-zed bg-white/45">
            {product.images[0]?.url ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt ?? product.name}
                fill
                sizes="(min-width:1024px) 50vw, 100vw"
                unoptimized
                className="object-cover"
              />
            ) : (
              <span className="grid aspect-square place-items-center font-display text-4xl text-soft-sage">ZED</span>
            )}
            {sale != null && sale > 0 && (
              <span className="absolute left-4 top-4 rounded-full bg-champagne px-3 py-1.5 text-xs font-bold text-charcoal">−{sale}%</span>
            )}
          </div>
          <div className="grid grid-cols-5 gap-3">
            {product.images.slice(0, 5).map((img) => (
              <div key={img.id} className="glass-panel relative aspect-square overflow-hidden rounded-zed ring-1 ring-white/50">
                <Image src={img.url} alt={img.alt ?? product.name} fill sizes="120px" unoptimized className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {categories.slice(0, 3).map((c) => (
              <Link key={c.id} href={`/gifts/${c.slug}`} className="rounded-full bg-warm-white px-3 py-1 text-[11px] font-semibold text-deep-olive hover:bg-champagne">
                {c.name}
              </Link>
            ))}
            {product.tags.slice(0, 2).map((t) => (
              <span key={t} className="rounded-full bg-white/45 px-3 py-1 text-[11px] font-semibold text-ink/60">
                {t}
              </span>
            ))}
          </div>

          <h1 className="mt-3 font-display text-3xl font-black leading-tight text-charcoal lg:text-4xl">{product.name}</h1>
          {product.headline && <p className="mt-2 text-lg text-soft-sage">{product.headline}</p>}

          <div className="mt-3 flex items-center gap-2">
            {breakdown.count > 0 ? (
              <>
                <span className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`size-4 ${s <= Math.round(breakdown.average) ? "fill-champagne text-champagne" : "text-ink/25"}`} />
                  ))}
                </span>
                <a href="#reviews" className="text-sm text-ink/60 underline-offset-2 hover:underline">
                  {breakdown.average.toFixed(1)} · {breakdown.count} review{breakdown.count === 1 ? "" : "s"}
                </a>
              </>
            ) : (
              <p className="text-sm text-ink/50">Be the first to review this gift</p>
            )}
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <p className="font-display text-4xl font-black text-charcoal">{formatKES(product.price)}</p>
            {product.compareAtPrice != null && product.compareAtPrice > product.price && (
              <>
                <p className="text-xl text-ink/40 line-through">{formatKES(product.compareAtPrice)}</p>
                <span className="rounded-full bg-champagne px-2.5 py-1 text-xs font-bold text-charcoal">
                  Save {formatKES(product.compareAtPrice - product.price)}
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-sm">
            {inStock ? (
              <span className="font-semibold text-soft-sage">In stock{totalStock <= product.lowStockThreshold ? ` — only ${totalStock} left` : ""}</span>
            ) : (
              <span className="font-semibold text-red-600">Out of stock</span>
            )}
          </p>

          {product.shortDescription && <p className="mt-5 leading-relaxed text-ink/75">{product.shortDescription}</p>}

          <div className="mt-7">
            <ProductPurchase
              productId={product.id}
              slug={product.slug}
              basePrice={product.price}
              compareAtPrice={product.compareAtPrice}
              variants={product.variants.map((v) => ({
                id: v.id,
                name: v.name,
                value: v.value,
                priceOffset: v.priceOffset,
                inStock: !product.trackInventory || v.quantity - v.reservedQuantity > 0,
              }))}
              personalizationFields={personalizationFields}
              giftWrapOptions={wrapOptions.map((w) => ({ id: w.id, name: w.name, price: w.price, active: w.active }))}
              giftWrapAvailable={product.giftWrapAvailable}
              giftMessageAvailable={product.giftMessageAvailable}
              inStock={inStock}
            />
          </div>

          {/* USPs */}
          <div className="glass-card mt-8 grid gap-3 rounded-zed p-5 sm:grid-cols-2">
            <div className="flex items-center gap-2.5 text-sm text-ink/75">
              <Truck className="size-5 shrink-0 text-soft-sage" />
              Same-day in Nairobi, 1–3 days countrywide
            </div>
            <div className="flex items-center gap-2.5 text-sm text-ink/75">
              <ShieldCheck className="size-5 shrink-0 text-soft-sage" />
              Secure M-PESA STK Push payment
            </div>
            <div className="flex items-center gap-2.5 text-sm text-ink/75">
              <Quote className="size-5 shrink-0 text-soft-sage" />
              Handwritten-style gift note included
            </div>
            <div className="flex items-center gap-2.5 text-sm text-ink/75">
              <span className="grid size-5 shrink-0 place-items-center rounded bg-champagne text-[10px] font-black text-charcoal">KES</span>
              Transparent pricing in Kenyan Shillings
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <section className="mx-auto mt-14 max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-charcoal">About this gift</h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-ink/75">{product.description}</p>
        </section>
      )}

      {/* Reviews */}
      <section id="reviews" className="mx-auto mt-14 max-w-4xl">
        <h2 className="font-display text-2xl font-bold text-charcoal">Customer reviews</h2>
        {breakdown.count > 0 && (
          <div className="mt-4 grid gap-6 sm:grid-cols-[180px_1fr]">
            <div>
              <p className="font-display text-5xl font-black text-charcoal">{breakdown.average.toFixed(1)}</p>
              <div className="mt-1 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`size-4 ${s <= Math.round(breakdown.average) ? "fill-champagne text-champagne" : "text-ink/25"}`} />
                ))}
              </div>
              <p className="mt-1 text-sm text-ink/50">{breakdown.count} review{breakdown.count === 1 ? "" : "s"}</p>
            </div>
            <div className="space-y-1.5">
              {breakdown.buckets.map((b) => (
                <div key={b.star} className="flex items-center gap-3 text-xs">
                  <span className="w-8 text-ink/60">{b.star}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/50">
                    <div className="h-full rounded-full bg-champagne" style={{ width: `${b.percent}%` }} />
                  </div>
                  <span className="w-8 text-right text-ink/50">{b.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            {reviews.length === 0 && (
              <p className="glass-panel rounded-zed border border-dashed border-white/50 px-5 py-8 text-sm text-ink/60">
                No reviews yet. Bought this gift? Tell us how it went.
              </p>
            )}
            {reviews.slice(0, 6).map((r) => (
              <article key={r.id} className="glass-card rounded-zed p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-full bg-warm-white font-bold text-deep-olive">
                      {(r.user?.name ?? "ZED").charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{r.user?.name ?? "Verified customer"}</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`size-3.5 ${s <= r.rating ? "fill-champagne text-champagne" : "text-ink/25"}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-ink/45">{r.createdAt.toLocaleDateString("en-KE", { month: "short", year: "numeric" })}</span>
                </div>
                {r.title && <p className="mt-3 font-semibold text-charcoal">{r.title}</p>}
                {r.comment && <p className="mt-1 text-sm leading-relaxed text-ink/75">{r.comment}</p>}
                {r.verifiedPurchase && (
                  <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-warm-white px-2.5 py-0.5 text-[11px] font-semibold text-deep-olive">
                    <Star className="size-3 fill-current" /> Verified purchase
                  </p>
                )}
              </article>
            ))}
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-charcoal">Write a review</h3>
            <p className="mb-4 mt-1 text-sm text-ink/55">Reviews are approved before they appear.</p>
            <ReviewForm productId={product.id} />
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-charcoal">You may also love</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}