import "server-only";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Clock,
  Coffee,
  Frame,
  Gift,
  KeyRound,
  MapPin,
  MessageCircle,
  Package,
  PenTool,
  Quote,
  Shirt,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { SITE } from "@/lib/constants";
import { getFeaturedProducts, getDealProducts } from "@/lib/data/products";
import { listCollections } from "@/lib/data/catalog";
import { prisma } from "@/lib/prisma";
import { formatKES } from "@/lib/utils";
import { ProductCard } from "@/components/product/ProductCard";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { OCCASION_CARDS, RECIPIENT_CARDS } from "@/lib/constants";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const PERSONALIZE_CARDS = [
  { icon: Coffee, title: "Custom Mugs", text: "Names, photos & messages" },
  { icon: Shirt, title: "Custom T-Shirts", text: "Prints & slogans" },
  { icon: Camera, title: "Photo Gifts", text: "Memories, made keepsakes" },
  { icon: Frame, title: "Personalized Frames", text: "Dates that matter" },
  { icon: KeyRound, title: "Custom Keyholders", text: "Small, but always theirs" },
  { icon: Gift, title: "Custom Hampers", text: "Curated for the moment" },
  { icon: PenTool, title: "Engraved Gifts", text: "Initials, forever" },
] as const;

const WHY_ZED = [
  { icon: Package, title: "Quality Gifts", text: "Carefully selected products made to make every occasion special." },
  { icon: Sparkles, title: "Personalized", text: "Create gifts that are unique to the person receiving them." },
  { icon: Truck, title: "Fast Delivery", text: "Same-day in Nairobi, tracked countrywide everywhere else." },
  { icon: ShieldCheck, title: "Secure Payments", text: "Safe and convenient M-PESA STK Push checkout." },
  { icon: MessageCircle, title: "Customer Support", text: "Friendly assistance whenever you need it — call or WhatsApp." },
] as const;

export default async function HomePage() {
  const [featured, deals, allCollections, personalized, testimonials] = await Promise.all([
    getFeaturedProducts(8),
    getDealProducts(4),
    listCollections(),
    prisma.product.findMany({
      where: { status: "ACTIVE", personalizationEnabled: true },
      take: 4,
      include: { images: true, collections: { include: { collection: true } }, categories: { include: { category: true } }, variants: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.findMany({
      where: { status: "APPROVED" },
      include: { user: { select: { name: true } }, product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);
  const collections = allCollections.filter((c) => c.featured).slice(0, 4);
  const hero = featured[0] ?? null;
  const hero2 = featured[1] ?? null;
  const hero3 = featured[2] ?? null;

  const sectionDelay = (i: number) => ({ animationDelay: `${i * 70}ms` });

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(120%_140%_at_80%_-20%,rgba(163,123,130,0.15),transparent_50%),radial-gradient(100%_120%_at_-10%_0%,rgba(90,31,43,0.44),transparent_55%),linear-gradient(145deg,#17120F_0%,#3B2035_52%,#17120F_100%)]" aria-hidden />
        <div className="glass-blob left-[-6%] top-[10%] h-80 w-80 bg-champagne/25 animate-[blob_24s_ease-in-out_infinite]" aria-hidden />
        <div className="glass-blob right-[4%] top-[-10%] h-96 w-96 bg-warm-white/40 animate-[blob_28s_ease-in-out_infinite]" aria-hidden />

        <div className="container-zed relative grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-24">
          {/* Left */}
          <div className="animate-[rise_0.7s_cubic-bezier(0.16,1,0.3,1)_both]">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-champagne backdrop-blur-md">
              <Sparkles className="size-3.5" /> Make every moment special
            </p>
            <h1 className="mt-6 text-balance font-display text-5xl font-black leading-[1.02] text-white sm:text-6xl lg:text-[4.25rem]">
              GIFTS THAT <span className="text-champagne">SAY MORE.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/80">
              Thoughtfully chosen, beautifully wrapped and delivered same-day in Nairobi. Personalized to the people who matter most.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-2xl bg-champagne px-7 py-4 text-sm font-bold uppercase tracking-wider text-charcoal shadow-glass transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-glass-lg"
              >
                Shop Now <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/gifts"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-7 py-4 text-sm font-bold uppercase tracking-wider text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-champagne hover:text-champagne"
              >
                Explore Gifts
              </Link>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-2 gap-x-4 gap-y-3 border-t border-white/15 pt-6 text-sm sm:grid-cols-4">
              <div className="flex items-center gap-2 text-white/85"><Truck className="size-4 text-champagne" /> Same-day NBO</div>
              <div className="flex items-center gap-2 text-white/85"><Gift className="size-4 text-champagne" /> Free gift box</div>
              <div className="flex items-center gap-2 text-white/85"><ShieldCheck className="size-4 text-champagne" /> M-PESA secure</div>
              <div className="flex items-center gap-2 text-white/85"><Clock className="size-4 text-champagne" /> Live tracking</div>
            </div>
          </div>

          {/* Right — floating glass composition */}
          <div className="relative min-h-[340px] sm:min-h-[460px]" aria-hidden>
            <div className="absolute right-0 top-0 w-[58%] rotate-2">
              <div className="glass-dark animate-float rounded-3xl p-2.5">
                {hero ? (
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={hero.images[0]?.url ?? "/placeholders/collection-bestsellers.svg"} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="grid aspect-[4/5] place-items-center rounded-2xl bg-white/10 font-display text-2xl font-black text-champagne">ZED</div>
                )}
              </div>
            </div>
            {hero2 && (
              <div className="absolute bottom-[8%] left-[2%] w-[42%] -rotate-3">
                <div className="glass-dark animate-[float_9s_ease-in-out_infinite] rounded-3xl p-2">
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={hero2.images[0]?.url ?? "/placeholders/collection-bestsellers.svg"} alt="" className="h-full w-full object-cover" />
                  </div>
                </div>
              </div>
            )}
            {hero3 && (
              <div className="absolute bottom-[2%] right-[8%] w-[24%] rotate-3">
                <div className="glass-dark animate-[float_11s_ease-in-out_infinite] rounded-2xl p-1.5">
                  <div className="aspect-square overflow-hidden rounded-xl bg-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={hero3.images[0]?.url ?? "/placeholders/collection-bestsellers.svg"} alt="" className="h-full w-full object-cover" />
                  </div>
                </div>
              </div>
            )}
            {hero && (
              <div className="glass-strong absolute left-[6%] top-[6%] animate-[float_7s_ease-in-out_infinite] rounded-2xl px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink/50">From</p>
                <p className="font-display text-lg font-black text-charcoal">{formatKES(hero.price)}</p>
                <p className="text-[11px] text-ink/60">Incl. signature gift box</p>
              </div>
            )}
            <div className="glass-strong absolute right-[10%] top-[38%] animate-[float_8s_ease-in-out_infinite] rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-3.5 fill-current" />)}
                </span>
                <span className="text-sm font-bold text-charcoal">4.9</span>
              </div>
              <p className="mt-0.5 text-[11px] text-ink/60">Loved by gifters across Kenya</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="container-zed py-14 lg:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Find by moment</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-charcoal lg:text-4xl">Shop the occasion</h2>
            <p className="mt-2 max-w-md text-sm text-ink/60">From birthdays to weddings — a gift for every moment, in every county.</p>
          </div>
          <Link href="/gifts" className="hidden items-center gap-1 text-sm font-semibold text-deep-olive hover:text-charcoal sm:inline-flex">
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {OCCASION_CARDS.map((c, i) => (
            <Link key={c.href} href={c.href} className="group glass-card animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_both] rounded-3xl p-2" style={sectionDelay(i)}>
              <div className="relative aspect-square overflow-hidden rounded-2xl">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${c.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-obsidian/10 to-transparent transition-opacity" />
                <span className="absolute inset-x-3 bottom-3 text-center font-display text-sm font-bold text-white drop-shadow">{c.title}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {RECIPIENT_CARDS.map((c) => (
            <Link key={c.href} href={c.href} className="group flex items-center gap-3 rounded-2xl glass-panel py-2 pl-2 pr-5 transition-all hover:-translate-y-1 hover:shadow-glass-lg">
              <span
                className="size-12 shrink-0 rounded-full bg-cover bg-center ring-2 ring-white/70 transition-all group-hover:ring-champagne"
                style={{ backgroundImage: `url(${c.image})` }}
              />
              <span className="text-sm font-semibold text-ink group-hover:text-deep-olive">{c.title}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== FEATURED GIFTS ===== */}
      <section className="container-zed pb-14 lg:pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Customer favourites</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-charcoal lg:text-4xl">Featured gifts</h2>
            <p className="mt-2 max-w-md text-sm text-ink/60">Best-sellers, new arrivals and personalized favourites — chosen for the people you love.</p>
          </div>
          <Link href="/shop" className="hidden items-center gap-1 text-sm font-semibold text-deep-olive hover:text-charcoal sm:inline-flex">
            View All Products <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-10 text-center lg:hidden">
          <Link href="/shop" className="inline-flex items-center gap-2 rounded-2xl bg-obsidian px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-champagne">
            View All Products <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* ===== MAKE IT PERSONAL ===== */}
      <section className="container-zed pb-14 lg:pb-20">
        <div className="relative overflow-hidden rounded-[2rem] p-8 sm:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(90%_120%_at_10%_0%,rgba(90,31,43,0.22),transparent_55%),radial-gradient(70%_100%_at_100%_20%,rgba(201,168,106,0.18),transparent_55%),linear-gradient(150deg,rgba(255,255,255,0.65),rgba(255,255,255,0.25))]" aria-hidden />
          <div className="glass-blob right-[-8%] top-[-20%] h-72 w-72 bg-champagne/20 animate-[blob_26s_ease-in-out_infinite]" aria-hidden />
          <div className="relative">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Zed made personal</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-charcoal lg:text-4xl">Make It Personal</h2>
                <p className="mt-2 max-w-xl text-sm text-ink/65">
                  Turn a beautiful gift into something truly unforgettable.
                </p>
              </div>
              <Link href="/personalized" className="inline-flex items-center gap-2 rounded-2xl bg-obsidian px-6 py-3 text-sm font-bold text-champagne transition-all hover:-translate-y-0.5 hover:shadow-glass-lg">
                Explore personalized <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {PERSONALIZE_CARDS.map((p, i) => (
                <Link key={p.title} href="/personalized" className="group glass-card rounded-2xl p-4 text-center animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_both]" style={sectionDelay(i)}>
                  <span className="mx-auto grid size-12 place-items-center rounded-full bg-white/70 text-deep-olive shadow-glass transition-transform group-hover:scale-110">
                    <p.icon className="size-5" />
                  </span>
                  <p className="mt-3 text-[13px] font-bold text-charcoal">{p.title}</p>
                  <p className="mt-0.5 text-[11px] text-ink/55">{p.text}</p>
                </Link>
              ))}
            </div>

            {personalized.length > 0 && (
              <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {personalized.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== SPECIAL OFFERS ===== */}
      <section className="container-zed pb-14 lg:pb-20">
        <div className="relative overflow-hidden rounded-[2rem] p-8 text-white sm:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(120%_140%_at_85%_0%,rgba(163,123,130,0.2),transparent_55%),radial-gradient(100%_130%_at_0%_100%,rgba(90,31,43,0.62),transparent_60%),linear-gradient(150deg,#3B2035_0%,#17120F_58%,#241A18_100%)]" aria-hidden />
          <div className="glass-blob left-[-6%] bottom-[-30%] h-80 w-80 bg-champagne/25 animate-[blob_24s_ease-in-out_infinite]" aria-hidden />
          <div className="glass-blob right-[12%] top-[-40%] h-72 w-72 bg-warm-white/45 animate-[blob_30s_ease-in-out_infinite]" aria-hidden />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-champagne backdrop-blur-md">
                <Sparkles className="size-3.5" /> Limited time
              </p>
              <h2 className="mt-5 font-display text-4xl font-black leading-tight sm:text-5xl">
                MAKE THEIR DAY <span className="text-champagne">EXTRA SPECIAL</span>
              </h2>
              <p className="mt-4 max-w-md text-lg text-white/80">
                Find something unforgettable for someone unforgettable.
              </p>
              <Link
                href="/deals"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-champagne"
              >
                Shop Special Offers <ArrowRight className="size-4" />
              </Link>
              <p className="mt-5 text-xs text-white/60">Free gift wrapping on every order · Same-day Nairobi delivery before 5pm</p>
            </div>

            {deals.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {deals.map((p, i) => (
                  <div key={p.id} className={`glass-dark rounded-2xl p-2.5 animate-[float_${8 + i * 2}s_ease-in-out_infinite]`} style={{ animationDelay: `${i * 0.6}s` }}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== WHY SHOP WITH ZED ===== */}
      <section className="container-zed pb-14 lg:pb-20">
        <div className="text-center">
          <p className="eyebrow">The ZED difference</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-charcoal lg:text-4xl">Why shop with ZED</h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {WHY_ZED.map((w, i) => (
            <div key={w.title} className="glass-card rounded-3xl p-6 text-center animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_both]" style={sectionDelay(i)}>
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.9),rgba(201,168,106,0.45)_70%)] text-charcoal shadow-glass">
                <w.icon className="size-6" />
              </span>
              <p className="mt-4 font-display text-lg font-bold text-charcoal">{w.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="container-zed pb-14 lg:pb-20">
        <div className="text-center">
          <p className="eyebrow">Kind words</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-charcoal lg:text-4xl">Loved by gifters across Kenya</h2>
        </div>
        {testimonials.length === 0 ? (
          <div className="glass-panel mx-auto mt-8 max-w-xl rounded-3xl p-8 text-center">
            <Quote className="mx-auto size-8 text-soft-sage" />
            <p className="mt-3 text-sm text-ink/70">
              Reviews appear here after customers approve them. Bought a gift from us? Your words help others choose.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((r, i) => (
              <figure key={r.id} className="glass-card flex flex-col rounded-3xl p-6 animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_both]" style={sectionDelay(i)}>
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className={`size-4 ${s < r.rating ? "fill-current" : "text-ink/20"} `} />
                  ))}
                </div>
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink/75">
                  {(r.comment ?? r.title ?? "Lovely gift, beautifully delivered.")}
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.95),rgba(90,31,43,0.25)_75%)] font-display font-black text-charcoal">
                    {(r.user?.name ?? "ZED").charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-bold text-charcoal">
                      {r.user?.name ?? "Verified customer"}
                      <BadgeCheck className="size-4 text-soft-sage" aria-label="Verified" />
                    </p>
                    {r.product && <p className="text-xs text-ink/55">gifted · {r.product.name}</p>}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      {/* ===== NEWSLETTER + CONTACT ===== */}
      <section className="container-zed pb-16 lg:pb-20">
        <div className="relative overflow-hidden rounded-[2rem] p-8 text-center lg:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(90%_140%_at_50%_-30%,rgba(201,168,106,0.16),transparent_60%),linear-gradient(160deg,rgba(255,255,255,0.75),rgba(255,255,255,0.3))]" aria-hidden />
          <div className="glass-blob left-[8%] bottom-[-40%] h-64 w-64 bg-warm-white/25 animate-[blob_26s_ease-in-out_infinite]" aria-hidden />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold text-charcoal lg:text-4xl">Never miss an occasion again</h2>
            <p className="mx-auto mt-3 max-w-md text-ink/65">
              Gift reminders, exclusive drops and members-only discounts. No spam, unsubscribe anytime.
            </p>
            <NewsletterForm />
            <p className="mt-6 text-sm text-ink/60">
              Questions? WhatsApp us at <a className="text-soft-sage underline underline-offset-2" href={SITE.whatsappHref}>{SITE.phone}</a> or email{" "}
              <a className="text-soft-sage underline underline-offset-2" href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-ink/45">
              <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> Nairobi, Kenya</span>
              <span className="flex items-center gap-1.5"><Truck className="size-3.5" /> Same-day delivery</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> Secure M-PESA checkout</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
