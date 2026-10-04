export const SITE = {
  name: "ZED GIFT SHOP",
  tagline: "GIFTS THAT SAY MORE.",
  description:
    "Premium Kenyan gifting and personalized products ecommerce store. Thoughtfully chosen gifts, personalized for the people who matter.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phone: "+254711436169",
  phoneHref: "tel:+254711436169",
  whatsappHref: "https://wa.me/254711436169",
  email: "felixsimon877@gmail.com",
  currency: "KES",
  country: "Kenya",
  announcement:
    "SAME-DAY NAIROBI DELIVERY • COUNTRYWIDE DELIVERY • SECURE M-PESA CHECKOUT",
} as const;

export const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Gifts", href: "/gifts" },
  { label: "Collections", href: "/collections" },
  { label: "Personalize", href: "/personalized" },
  { label: "Gift Builder", href: "/gift-builder" },
  { label: "Deals", href: "/deals" },
] as const;

export const GIFT_ROUTES = [
  { label: "Gifts for Him", href: "/gifts/for-him", slug: "for-him" },
  { label: "Gifts for Her", href: "/gifts/for-her", slug: "for-her" },
  { label: "Gifts for Couples", href: "/gifts/for-couples", slug: "for-couples" },
  { label: "Birthday", href: "/gifts/birthday", slug: "birthday" },
  { label: "Anniversary", href: "/gifts/anniversary", slug: "anniversary" },
  { label: "Graduation", href: "/gifts/graduation", slug: "graduation" },
  { label: "Corporate", href: "/gifts/corporate", slug: "corporate" },
] as const;

export const OCCASION_CARDS = [
  { title: "Birthday", href: "/gifts/birthday", image: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=900&q=75" },
  { title: "Anniversary", href: "/gifts/anniversary", image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=75" },
  { title: "Love", href: "/gifts/for-couples", image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=75" },
  { title: "Graduation", href: "/gifts/graduation", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=75" },
  { title: "Corporate", href: "/gifts/corporate", image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=900&q=75" },
  { title: "Just Because", href: "/shop", image: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=900&q=75" },
] as const;

export const RECIPIENT_CARDS = [
  { title: "For Him", href: "/gifts/for-him", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=75" },
  { title: "For Her", href: "/gifts/for-her", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=75" },
  { title: "For Couples", href: "/gifts/for-couples", image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=75" },
  { title: "For Friends", href: "/gifts/for-friends", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=75" },
  { title: "For Parents", href: "/gifts/for-parents", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=75" },
  { title: "For Colleagues", href: "/gifts/for-colleagues", image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=600&q=75" },
] as const;

export const KENYA_COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita-Taveta", "Garissa", "Wajir",
  "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka-Nithi", "Embu", "Kitui", "Machakos",
  "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot",
  "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo-Marakwet", "Nandi", "Baringo", "Laikipia",
  "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia",
  "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi",
] as const;

export type CartItemPayload = {
  productId: string;
  variantId?: string | null;
  quantity: number;
  personalization?: Record<string, unknown> | null;
  giftWrap?: { id: string; name: string; price: number } | null;
  giftMessage?: { message: string; from?: string; to?: string } | null;
};

export const COOKIE_KEYS = {
  cart: "zed_cart",
  session: "zed_session",
  wishlist: "zed_wishlist",
} as const;

export const CART_MAX_ITEMS = 50;

export const ORDER_STATUS_STEPS: { status: string; label: string }[] = [
  { status: "PENDING_PAYMENT", label: "Order placed" },
  { status: "PAID", label: "Payment confirmed" },
  { status: "PROCESSING", label: "Being prepared" },
  { status: "CUSTOMIZATION", label: "Being personalized" },
  { status: "READY_FOR_DISPATCH", label: "Ready for dispatch" },
  { status: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { status: "DELIVERED", label: "Delivered" },
];

export const ORDER_STATUS_LABELS = Object.fromEntries(ORDER_STATUS_STEPS.map((s) => [s.status, s.label])) as Record<string, string>;

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending Verification",
  SUCCESS: "Paid",
  FAILED: "Payment failed",
  CANCELLED: "Cancelled",
  BANK_TRANSFER: "Bank Transfer",
};