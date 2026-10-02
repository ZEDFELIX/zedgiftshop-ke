import { ListingPage } from "@/components/shop/ListingPage";
import { FlashSaleCountdown } from "@/components/shop/FlashSaleCountdown";
import Image from "next/image";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Shop All Gifts",
  description:
    "Browse the full ZED GIFT SHOP catalogue — personalized keepsakes, gift boxes, corporate gifts and more, delivered across Kenya.",
};

function boolParam(value: unknown) {
  return value === "1" || value === "true";
}

export default async function ShopPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const filters = {
    q: get("q"),
    category: get("category"),
    occasion: get("occasion"),
    recipient: get("recipient"),
    collection: get("collection"),
    min: get("min") ? Number(get("min")) : undefined,
    max: get("max") ? Number(get("max")) : undefined,
    personalized: boolParam(get("personalized")),
    inStock: boolParam(get("inStock")),
    sort: get("sort"),
    page: get("page") ? Number(get("page")) : 1,
  } as const;

  return (
    <div className="container-zed py-10 lg:py-14">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-black lg:text-4xl">
          Shop All Gifts
        </h1>
        <p className="mt-3 leading-relaxed text-black/70 description">
          Every gift in the ZED range — filter by occasion, recipient, budget and personalization.
        </p>
      </header>

      {/* Flash Sale Countdown — prominent banner */}
      <FlashSaleCountdown
        sale={{ start: "2026-10-15T00:00:00Z", end: "2026-10-20T23:59:59Z", discount: 20 }}
      />

      {/* Featured section — new arrivals & on-sale highlights */}
      <section className="mb-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* New arrival card */}
          <div
            key="new-arrival"
            className="group round rounded-xl bg-white/80 p-4 hover:bg-white/90 transition-colors border-zed-900/20"
          >
            <div className="relative h-48 mb-3">
              <Image
                src="/placeholder-600x400.jpg"
                alt="New arrival leather journal"
                fill
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05]"
              />
            </div>
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-zed-950">New</p>
              <h3 className="font-display text-base font-semibold line-clamp-2 hover:text-zed-950 transition-colors">
                Leather Journal
              </h3>
              <p className="mt-1 text-sm text-black/60">Premium grain leather, refillable</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-[13px] font-bold text-black">KES 4,900</p>
                <p className="text-sm text-black/40 line-through">KES 5,500</p>
              </div>
            </div>
          </div>

          {/* Best seller card */}
          <div
            key="best-seller"
            className="group round rounded-xl bg-white/80 p-4 hover:bg-white/90 transition-colors border-zed-900/20"
          >
            <div className="relative h-48 mb-3">
              <Image
                src="/placeholder-600x400.jpg"
                alt="Best seller gift box"
                fill
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05]"
              />
            </div>
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-zed-950">Best</p>
              <h3 className="font-display text-base font-semibold line-clamp-2 hover:text-zed-950 transition-colors">
                Gift Box
              </h3>
              <p className="mt-1 text-sm text-black/60">Corporate gifting solution</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-[13px] font-bold text-black">KES 3,200</p>
                <p className="text-sm text-black/40 line-through">KES 3,800</p>
              </div>
            </div>
          </div>

          {/* Personalized card */}
          <div
            key="personalized"
            className="group round rounded-xl bg-white/80 p-4 hover:bg-white/90 transition-colors border-zed-900/20"
          >
            <div className="relative h-48 mb-3">
              <Image
                src="/placeholder-600x400.jpg"
                alt="Personalized gift"
                fill
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05]"
              />
            </div>
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-zed-950">Personal</p>
              <h3 className="font-display text-base font-semibold line-clamp-2 hover:text-zed-950 transition-colors">
                Personalized Gift
              </h3>
              <p className="mt-1 text-sm text-black/60">Engraved with initials</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-[13px] font-bold text-black">KES 2,800</p>
                <p className="text-sm text-black/40 line-through">KES 3,200</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ListingPage
        title="Shop All Gifts"
        eyebrow="The full collection"
        description="Every gift in the ZED range — filter by occasion, recipient, budget and personalization."
        filters={{ ...filters }}
        href="/shop"
      />
    </div>
  );
}