import { ListingPage } from "@/components/shop/ListingPage";
import { FlashSaleCountdown } from "@/components/shop/FlashSaleCountdown";
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
      <ListingPage
        title="Shop All Gifts"
        eyebrow="The full collection"
        description="Every gift in the ZED range — filter by occasion, recipient, budget and personalization."
        filters={{ ...filters }}
        href="/shop"
      />

      <FlashSaleCountdown
        sale={{ start: "2026-10-15T00:00:00Z", end: "2026-10-20T23:59:59Z", discount: 20 }}
      />
    </div>
  );
}