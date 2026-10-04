import { ListingPage } from "@/components/shop/ListingPage";
import { FlashSaleCountdown } from "@/components/shop/FlashSaleCountdown";
import { getDealProducts } from "@/lib/data/products";
import Image from "next/image";
import { formatKES } from "@/lib/utils";
import { SITE } from "@/lib/constants";

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
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {dealProducts.map((product) => (
            <div key={product.id} className="rounded-xl bg-white/80 p-3 hover:bg-white/90 transition-colors">
              {product.images[0]?.url ? (
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  className="rounded-zed h-32 object-cover mb-2"
                />
              ) : (
                <div className="rounded-zed h-32 bg-panel/60 mb-2"></div>
              )}
              <p className="text-xs font-semibold text-black line-clamp-1">{product.name}</p>
              <p className="mt-1 text-[11px] line-through text-black/40">{formatKES(product.compareAtPrice ?? product.price)}</p>
              <p className="mt-1 text-[11px] font-bold text-zed-950">{formatKES(product.price)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}