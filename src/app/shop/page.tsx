import { ListingPage } from "@/components/shop/ListingPage";
import { FlashSaleCountdown } from "@/components/shop/FlashSaleCountdown";
import { FlashSaleGrid } from "@/components/shop/FlashSaleGrid";
import { getDealProducts } from "@/lib/data/products";

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

  // Fetch flash sale products with compareAtPrice (discounted products)
  const dealProducts = await getDealProducts(6);

  return (
    <div className="container-zed py-10 lg:py-14">
      <ListingPage
        title=""
        eyebrow=""
        description=""
        filters={{ ...filters }}
        href="/shop"
      />

      {dealProducts.length > 0 && (
        <FlashSaleCountdown
          sale={{ start: new Date().toISOString(), end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), discount: 20 }}
        />
      )}

      {dealProducts.length > 0 && (
        <div className="mt-6">
          <FlashSaleGrid products={dealProducts} />
        </div>
      )}
    </div>
  );
}