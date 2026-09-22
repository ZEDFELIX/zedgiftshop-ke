import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  COLLECTION_PHOTO,
  OCCASION_PHOTO,
  PRODUCT_PHOTO,
  RECIPIENT_PHOTO,
  photoUrl,
} from "../scripts/demo-images";

const prisma = new PrismaClient();

function placeholder(name: string, alt: string) {
  const url = PRODUCT_PHOTO[name] ? photoUrl(PRODUCT_PHOTO[name]) : `/placeholders/${name}.svg`;
  return { url, alt, sortOrder: 0, isPrimary: true };
}

function categoryImage(slug: string, kind: "CATEGORY" | "OCCASION" | "RECIPIENT") {
  if (kind === "CATEGORY") return `/placeholders/category-${slug}.svg`;
  const photoKey = kind === "OCCASION" ? OCCASION_PHOTO[slug] : RECIPIENT_PHOTO[slug];
  return photoKey ? photoUrl(photoKey) : `/placeholders/${kind === "OCCASION" ? "occasion" : "recipient"}-${slug}.svg`;
}

const KES = (n: number) => n;

async function upsertUser(data: {
  email: string;
  name: string;
  password: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
  phone?: string;
}) {
  const passwordHash = await bcrypt.hash(data.password, 12);
  return prisma.user.upsert({
    where: { email: data.email },
    update: { role: data.role, name: data.name },
    create: {
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: data.role,
      emailVerified: new Date(),
      passwordHash,
    },
  });
}

async function upsertCategory(slug: string, name: string, kind: "CATEGORY" | "OCCASION" | "RECIPIENT", description?: string) {
  return prisma.category.upsert({
    where: { slug },
    update: { name, active: true },
    create: {
      slug,
      name,
      kind,
      description,
      active: true,
      image: categoryImage(slug, kind),
    },
  });
}

async function linkCategories(productId: string, slugs: string[]) {
  for (const slug of slugs) {
    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category) continue;
    await prisma.productCategory.upsert({
      where: { productId_categoryId: { productId, categoryId: category.id } },
      update: {},
      create: { productId, categoryId: category.id },
    });
  }
}

async function upsertCollection(slug: string, name: string, description?: string, featured = false) {
  return prisma.collection.upsert({
    where: { slug },
    update: { name, featured },
    create: { slug, name, description, featured, image: COLLECTION_PHOTO[slug] ? photoUrl(COLLECTION_PHOTO[slug]) : `/placeholders/collection-${slug}.svg` },
  });
}

async function linkCollections(productId: string, slugs: string[]) {
  for (const slug of slugs) {
    const collection = await prisma.collection.findUnique({ where: { slug } });
    if (!collection) continue;
    await prisma.productCollection.upsert({
      where: { productId_collectionId: { productId, collectionId: collection.id } },
      update: {},
      create: { productId, collectionId: collection.id },
    });
  }
}

type SeedProduct = {
  slug: string;
  name: string;
  headline?: string;
  shortDescription?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  tags: string[];
  quantity: number;
  personalizationEnabled?: boolean;
  giftWrapAvailable?: boolean;
  featured?: boolean;
  bestSeller?: boolean;
  categories: string[];
  collections?: string[];
  variants?: { name: string; value: string; priceOffset?: number; quantity?: number }[];
  image: string;
  deliveryNote?: string;
};

const PRODUCTS: SeedProduct[] = [
  {
    slug: "lumina-leather-journal",
    name: "The Lumina Leather Journal",
    headline: "Debossed initials on full-grain leather",
    shortDescription: "A personal journal that arrives with their initials pressed into rich, full-grain leather.",
    description:
      "Hand-finished vegan-leather cover, 160 GSM fountain-pen friendly paper, elastic closure and a ribbon bookmark. Deboss their initials on the front cover for a keepsake that lasts for years.",
    price: KES(2450),
    compareAtPrice: KES(2950),
    sku: "ZED-JRNL-LUM",
    tags: ["journal", "leather", "personalized", "desk"],
    quantity: 42,
    personalizationEnabled: true,
    giftWrapAvailable: true,
    featured: true,
    bestSeller: true,
    categories: ["birthday", "anniversary", "for-her", "for-him"],
    collections: ["bestsellers", "personalized-picks"],
    variants: [
      { name: "Size", value: "A5", quantity: 20 },
      { name: "Size", value: "B6", priceOffset: -200, quantity: 14 },
      { name: "Colour", value: "Emerald", quantity: 10 },
      { name: "Colour", value: "Burgundy", quantity: 10 },
      { name: "Colour", value: "Champagne", quantity: 8 },
    ],
    image: "product-01",
  },
  {
    slug: "classic-photo-frame-set",
    name: "Classic Photo Frame Set",
    headline: "A gallery of their favourite moments",
    shortDescription: "Set of three gallery frames in your choice of finish.",
    description:
      "Three museum-quality gallery frames sized 5x7, 4x6 and 3x4. Choose from five finishes to match any room.",
    price: KES(1890),
    sku: "ZED-FRAME-CLS",
    tags: ["photo", "frame", "home"],
    quantity: 35,
    giftWrapAvailable: true,
    featured: true,
    categories: ["anniversary", "for-parents", "for-couples"],
    collections: ["bestsellers", "home-and-living"],
    variants: [
      { name: "Finish", value: "Gold Trim" },
      { name: "Finish", value: "Walnut", priceOffset: 150 },
      { name: "Finish", value: "Matte Black" },
      { name: "Finish", value: "White Oak", priceOffset: 150 },
    ],
    image: "product-02",
  },
  {
    slug: "personalized-name-mug",
    name: "Personalized Name Mug",
    headline: "Their name, your message — 300ml stoneware",
    shortDescription: "A 300ml glossy stoneware mug printed with their name and a short message.",
    description:
      "Printed on both sides with your chosen name and message in your pick of font. Dishwasher and microwave safe.",
    price: KES(990),
    sku: "ZED-MUG-NAME",
    tags: ["mug", "personalized", "kitchen"],
    quantity: 80,
    personalizationEnabled: true,
    giftWrapAvailable: true,
    categories: ["birthday", "for-friends", "for-colleagues"],
    collections: ["personalized-picks"],
    variants: [
      { name: "Colour", value: "White" },
      { name: "Colour", value: "Black", priceOffset: 50 },
      { name: "Colour", value: "Blush", priceOffset: 50 },
      { name: "Colour", value: "Mint", priceOffset: 50 },
    ],
    image: "product-03",
  },
  {
    slug: "scented-soy-candle-trio",
    name: "Scented Soy Candle Trio",
    headline: "Three clean-burning scents in one box",
    shortDescription: "A trio of 100% soy candles — lavender, oud & amber, citrus garden.",
    description:
      "Hand-poured 100% soy wax with cotton wicks and a 35-hour burn time per candle. Comes as a set of three in a keepsake box.",
    price: KES(1750),
    compareAtPrice: KES(2100),
    sku: "ZED-CNDL-TRIO",
    tags: ["candle", "home", "relax"],
    quantity: 50,
    giftWrapAvailable: true,
    categories: ["for-her", "for-couples", "just-because"],
    collections: ["bestsellers", "home-and-living"],
    image: "product-04",
  },
  {
    slug: "his-her-watch-box",
    name: "His & Hers Matching Watch Box",
    headline: "A pair to mark a milestone",
    shortDescription: "Two minimalist timepieces in a lined presentation box.",
    description:
      "Slim mesh strap watches with Japanese quartz movement. Presented in a magnetic faux-leather box ready for gifting.",
    price: KES(5200),
    sku: "ZED-WATCH-HH",
    tags: ["watch", "couples", "luxury"],
    quantity: 18,
    giftWrapAvailable: true,
    featured: true,
    bestSeller: true,
    categories: ["anniversary", "for-couples", "valentines"],
    collections: ["bestsellers"],
    variants: [
      { name: "Strap", value: "Rose Gold" },
      { name: "Strap", value: "Gold" },
      { name: "Strap", value: "Silver", priceOffset: -100 },
    ],
    image: "product-05",
  },
  {
    slug: "leather-card-holder",
    name: "Slim Leather Card Holder",
    headline: "Vegan leather, RFID shielded",
    shortDescription: "A slim two-sided card holder with RFID shielding and embossed monogram option.",
    description:
      "Holds up to eight cards in full-grain vegan leather with an elastic money band. Monogram available at checkout.",
    price: KES(1450),
    sku: "ZED-LEATH-CARD",
    tags: ["leather", "wallet", "men"],
    quantity: 60,
    personalizationEnabled: true,
    giftWrapAvailable: true,
    categories: ["for-him", "corporate", "fathers-day"],
    collections: ["corporate", "personalized-picks"],
    variants: [
      { name: "Colour", value: "Tan" },
      { name: "Colour", value: "Black" },
      { name: "Colour", value: "Navy", priceOffset: 50 },
    ],
    image: "product-06",
  },
  {
    slug: "chocolate-coldbrew-gift-box",
    name: "Chocolate & Cold Brew Box",
    headline: "Single-origin treats for coffee lovers",
    shortDescription: "Specialty cold brew sachets paired with Kenyan single-origin chocolate.",
    description:
      "Four sachets of ready-to-brew specialty cold brew plus a bar of 72% single-origin Kenyan dark chocolate. A flavour-forward gift that travels well.",
    price: KES(2100),
    sku: "ZED-FOOD-CB",
    tags: ["chocolate", "coffee", "food"],
    quantity: 45,
    categories: ["for-colleagues", "corporate", "just-because"],
    collections: ["corporate", "gourmet"],
    image: "product-07",
  },
  {
    slug: "framed-custom-map-art",
    name: "Framed Custom Map Art",
    headline: "Where your story began",
    shortDescription: "A hand-annotated map of a special place, framed and ready to hang.",
    description:
      "Pick a city or neighbourhood, choose a theme colour, and we mark the spot with a vintage-styled compass. Printed on matte archival paper in a solid oak frame.",
    price: KES(3200),
    sku: "ZED-MAP-CUST",
    tags: ["map", "custom", "home"],
    quantity: 22,
    personalizationEnabled: true,
    giftWrapAvailable: true,
    categories: ["anniversary", "for-couples", "for-parents"],
    collections: ["personalized-picks", "home-and-living"],
    variants: [
      { name: "Frame", value: "Black" },
      { name: "Frame", value: "Oak", priceOffset: 200 },
      { name: "Theme", value: "Midnight" },
      { name: "Theme", value: "Classic" },
    ],
    image: "product-08",
  },
  {
    slug: "engraved-wooden-keepsake-box",
    name: "Engraved Wooden Keepsake Box",
    headline: "A home for their treasures",
    shortDescription: "Solid mango-wood box with laser-engraved cover, felt-lined interior.",
    description:
      "Laser-engrave a name, date or short message on the lid. Magnet closure, cedar-scented felt lining, 20 x 13 x 6cm.",
    price: KES(2950),
    sku: "ZED-KEEP-WOOD",
    tags: ["box", "wood", "keepsake"],
    quantity: 27,
    personalizationEnabled: true,
    giftWrapAvailable: true,
    bestSeller: true,
    categories: ["anniversary", "for-her", "wedding"],
    collections: ["bestsellers", "personalized-picks"],
    image: "product-09",
  },
  {
    slug: "mens-grooming-kit",
    name: "Executive Grooming Kit",
    headline: "Beard, skin & shave in one tin",
    shortDescription: "Travel-ready grooming essentials in a vintage tin box.",
    description:
      "Beard oil, face balm, shave soap and a safety razor housed in a portable tin. Natural, cruelty-free formulas.",
    price: KES(2650),
    sku: "ZED-GROOM-MEN",
    tags: ["grooming", "men", "personal care"],
    quantity: 33,
    giftWrapAvailable: true,
    categories: ["for-him", "fathers-day", "birthday"],
    collections: ["bestsellers"],
    image: "product-10",
  },
  {
    slug: "graduation-memory-keepsake",
    name: "Graduation Memory Keepsake",
    headline: "Celebrate the big day",
    shortDescription: "A framed keepsake card with place for their graduation photo.",
    description:
      "A minimalist celebration card with gold foil, sized to hold a 4x6 graduation photo, delivered in a gift-ready box.",
    price: KES(1800),
    sku: "ZED-GRAD-KEEP",
    tags: ["graduation", "keepsake", "celebration"],
    quantity: 40,
    categories: ["graduation"],
    collections: ["bestsellers"],
    variants: [
      { name: "Colour", value: "Gold" },
      { name: "Colour", value: "Emerald", priceOffset: 100 },
    ],
    image: "product-11",
  },
  {
    slug: "custom-star-map-print",
    name: "Custom Star Map Print",
    headline: "The night sky from their special day",
    shortDescription: "A print of the night sky exactly as it was on a date you choose.",
    description:
      "We recreate the stars above any location on any date. Bold flat-colour print, A3, shipped in a rigid tube.",
    price: KES(2250),
    sku: "ZED-STAR-MAP",
    tags: ["star map", "romantic", "print"],
    quantity: 25,
    personalizationEnabled: true,
    giftWrapAvailable: true,
    categories: ["anniversary", "for-couples", "valentines"],
    collections: ["personalized-picks"],
    image: "product-12",
  },
  {
    slug: "tea-treats-hamper",
    name: "Tea & Treats Hamper",
    headline: "A cozy afternoon in a box",
    shortDescription: "Loose-leaf teas, honey sticks and shortbread bites.",
    description:
      "Three single-origin Kenyan teas, artisan honey sticks, shortbread and a keepsake mug. Comfort delivered in a sturdy gift box.",
    price: KES(1450),
    sku: "ZED-TEA-HAMPER",
    tags: ["tea", "hamper", "food"],
    quantity: 55,
    categories: ["just-because", "for-friends", "for-colleagues"],
    collections: ["gourmet"],
    image: "product-13",
  },
  {
    slug: "corporate-pen-notebook-set",
    name: "Corporate Pen & Notebook Set",
    headline: "Branded-ready, premium finish",
    shortDescription: "Metal rollerball pen with a hardcover notebook in a sleeve.",
    description:
      "A refillable metal rollerball and A5 dotted-grid notebook. Ideal for onboarding, appreciation and client gifts. Bulk orders supported.",
    price: KES(1650),
    sku: "ZED-CORP-PENSET",
    tags: ["corporate", "office", "branded"],
    quantity: 70,
    categories: ["corporate", "for-colleagues"],
    collections: ["corporate"],
    variants: [
      { name: "Colour", value: "Black" },
      { name: "Colour", value: "Forest", priceOffset: 50 },
    ],
    image: "product-14",
  },
  {
    slug: "birthday-balloon-cake-kit",
    name: "Birthday Balloon & Cake Topper Kit",
    headline: "Instant party energy",
    shortDescription: "Foil balloons, honeycomb ball and a gold cake topper.",
    description:
      "A ready-to-inflate kit: two foil balloons, a honeycomb ball and a laser-cut cake topper. Perfect for same-day birthday surprises.",
    price: KES(850),
    sku: "ZED-BDAY-KIT",
    tags: ["birthday", "party", "balloon"],
    quantity: 90,
    categories: ["birthday"],
    collections: ["bestsellers"],
    image: "product-15",
  },
  {
    slug: "plantable-seed-card-set",
    name: "Plantable Seed Card Set",
    headline: "A gift that grows",
    shortDescription: "Five wildflower seed cards that grow when planted.",
    description:
      "A thoughtful, plastic-free gift. Each card is embedded with native wildflower seeds — plant, water, watch it bloom.",
    price: KES(650),
    sku: "ZED-SEED-CARDS",
    tags: ["eco", "cards", "stationery"],
    quantity: 100,
    categories: ["for-colleagues", "just-because"],
    collections: ["gourmet"],
    image: "product-16",
  },
];

async function main() {
  // ---- Users ----
  await upsertUser({
    email: "admin@zedgiftshop.co.ke",
    name: "ZED Admin",
    password: "Admin@12345",
    role: "ADMIN",
    phone: "+254711436169",
  });
  await upsertUser({
    email: "staff@zedgiftshop.co.ke",
    name: "ZED Staff",
    password: "Staff@12345",
    role: "STAFF",
    phone: "+254711436169",
  });
  const demo = await upsertUser({
    email: "demo@zedgiftshop.co.ke",
    name: "Demo Customer",
    password: "Demo@12345",
    role: "CUSTOMER",
    phone: "+254712345678",
  });

  // ---- Categories ----
  const occasionSlugs = [
    ["birthday", "Birthday", "Birthday gifts that arrive fast and personal."],
    ["anniversary", "Anniversary", "Milestone-worthy gifts for your person."],
    ["graduation", "Graduation", "Celebrate the next chapter in style."],
    ["corporate", "Corporate Gifts", "Client, staff and onboarding gifts at scale."],
    ["valentines", "Valentine's Day", "Romantic gifts that say more."],
    ["fathers-day", "Father's Day", "Gifts for the man who raised you."],
    ["wedding", "Wedding", "Wedding, bridal and couple gifts."],
    ["just-because", "Just Because", "Zero occasion required."],
  ] as const;
  const recipientSlugs = [
    ["for-him", "Gifts for Him"],
    ["for-her", "Gifts for Her"],
    ["for-couples", "Gifts for Couples"],
    ["for-friends", "For Friends"],
    ["for-parents", "For Parents"],
    ["for-colleagues", "For Colleagues"],
  ] as const;

  for (const [slug, name, description] of occasionSlugs) {
    await upsertCategory(slug, name, "OCCASION", description);
  }
  for (const [slug, name] of recipientSlugs) {
    await upsertCategory(slug, name, "RECIPIENT");
  }

  // ---- Collections ----
  await upsertCollection("bestsellers", "Bestsellers", "The gifts customers keep coming back for.", true);
  await upsertCollection("new-arrivals", "New Arrivals", "Fresh on the shelf this week.", true);
  await upsertCollection("corporate", "Corporate Gifts", "Curated for teams, clients and events.");
  await upsertCollection("personalized-picks", "Personalized Picks", "Made extra special with a name or message.");
  await upsertCollection("home-and-living", "Home & Living", "Objects that make a space feel like them.");
  await upsertCollection("gourmet", "Gourmet", "Eat, drink and celebrate.");

  // ---- Products ----
  for (const p of PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        headline: p.headline,
        shortDescription: p.shortDescription,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        sku: p.sku,
        tags: p.tags,
        status: "ACTIVE",
        featured: p.featured ?? false,
        bestSeller: p.bestSeller ?? false,
        publishedAt: new Date(),
        quantity: p.quantity,
        trackInventory: true,
        personalizationEnabled: p.personalizationEnabled ?? false,
        personalizationFieldsJson: p.personalizationEnabled
          ? JSON.stringify([
              p.slug.includes("mug") ? { key: "name", label: "Name to print", type: "text", required: true } : { key: "initials", label: "Initials / name", type: "text", required: true },
            ])
          : null,
        giftWrapAvailable: p.giftWrapAvailable ?? false,
        giftMessageAvailable: true,
        deliveryNote: p.deliveryNote,
      },
      create: {
        slug: p.slug,
        name: p.name,
        headline: p.headline,
        shortDescription: p.shortDescription,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        sku: p.sku,
        tags: p.tags,
        status: "ACTIVE",
        featured: p.featured ?? false,
        bestSeller: p.bestSeller ?? false,
        publishedAt: new Date(),
        quantity: p.quantity,
        trackInventory: true,
        personalizationEnabled: p.personalizationEnabled ?? false,
        personalizationFieldsJson: p.personalizationEnabled
          ? JSON.stringify([
              { key: "name", label: "Engraving text", type: "text", required: true, maxLength: 24 },
            ])
          : null,
        giftWrapAvailable: p.giftWrapAvailable ?? false,
        giftMessageAvailable: true,
        deliveryNote: p.deliveryNote,
        images: { create: [placeholder(p.image, p.name)] },
        variants: p.variants
          ? {
              create: p.variants.map((v, i) => ({
                name: v.name,
                value: v.value,
                sku: `${p.sku}-${String(i + 1).padStart(2, "0")}`,
                priceOffset: v.priceOffset ?? 0,
                quantity: v.quantity ?? p.quantity,
                active: true,
              })),
            }
          : undefined,
      },
    });

    await linkCategories(product.id, p.categories);
    const collections = p.variants?.some((v) => v.name === "Colour")
      ? [...(p.collections ?? [])]
      : [...(p.collections ?? [])];
    await linkCollections(product.id, collections.length ? collections : ["new-arrivals"]);
  }

  // ---- Delivery zones ----
  const zones: { county: string; town?: string; fee: number; deliveryTime?: string; sameDay?: boolean }[] = [
    { county: "Nairobi", fee: 150, deliveryTime: "1–3 business days", sameDay: true },
    { county: "Nairobi", town: "CBD & Westlands", fee: 300, deliveryTime: "Same day (order before 2pm)", sameDay: true },
    { county: "Kiambu", fee: 200, deliveryTime: "1–2 business days", sameDay: true },
    { county: "Mombasa", fee: 350, deliveryTime: "2–3 business days" },
    { county: "Kisumu", fee: 350, deliveryTime: "2–3 business days" },
    { county: "Nakuru", fee: 300, deliveryTime: "2–3 business days" },
    { county: "Uasin Gishu", town: "Eldoret", fee: 350, deliveryTime: "2–3 business days" },
    { county: "Machakos", town: "Athi River", fee: 250, deliveryTime: "1–2 business days", sameDay: true },
    { county: "Kajiado", town: "Kitengela", fee: 250, deliveryTime: "1–2 business days", sameDay: true },
  ];
  for (const z of zones) {
    await prisma.deliveryZone.upsert({
      where: { county_town: { county: z.county, town: z.town ?? "" } },
      update: { fee: z.fee, deliveryTime: z.deliveryTime, sameDay: z.sameDay ?? false, active: true },
      create: {
        county: z.county,
        town: z.town ?? "",
        fee: z.fee,
        deliveryTime: z.deliveryTime,
        sameDay: z.sameDay ?? false,
        active: true,
      },
    });
  }

  // ---- Gift wrap ----
  const wraps = [
    { name: "Standard Gift Box", sku: "WRAP-STD", price: 150, description: "Rigid kraft box with tissue and sticker." },
    { name: "Premium Box + Ribbon", sku: "WRAP-PRM", price: 350, description: "Gift-ready box, satin ribbon and a ZED card." },
    { name: "Luxury Box + Personal Card", sku: "WRAP-LUX", price: 650, description: "Signature box with a handwritten-style card." },
  ];
  for (const w of wraps) {
    await prisma.giftWrap.upsert({
      where: { sku: w.sku ?? "" },
      update: { name: w.name, price: w.price, description: w.description, active: true },
      create: { name: w.name, sku: w.sku, price: w.price, description: w.description, active: true, sortOrder: w.price },
    });
  }

  // ---- Coupons ----
  const coupons = [
    { code: "WELCOME10", type: "PERCENTAGE" as const, value: 10, minSpend: 0, description: null },
    { code: "ZED5OFF", type: "FIXED" as const, value: 500, minSpend: 3000, description: "KES 500 off orders over 3,000." },
    { code: "KENYAN10", type: "PERCENTAGE" as const, value: 10, minSpend: 2500, description: null },
  ];
  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: { type: c.type, value: c.value, minSpend: c.minSpend, active: true, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90) },
      create: {
        code: c.code,
        type: c.type,
        value: c.value,
        minSpend: c.minSpend,
        active: true,
        scope: "ALL",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      },
    });
  }

  // ---- Sample order for the demo user ----
  const frame = await prisma.product.findUnique({ where: { slug: "classic-photo-frame-set" } });
  const journal = await prisma.product.findUnique({ where: { slug: "lumina-leather-journal" } });
  if (frame && journal) {
    const existing = await prisma.order.findFirst({ where: { email: demo.email } });
    if (!existing) {
      await prisma.order.create({
        data: {
          orderNumber: `ZED-${Date.now().toString().slice(-8)}`,
          userId: demo.id,
          name: demo.name,
          email: demo.email,
          phone: "+254712345678",
          subtotal: frame.price + journal.price,
          discount: 0,
          deliveryFee: 150,
          total: frame.price + journal.price + 150,
          deliveryMethod: "STANDARD",
          county: "Nairobi",
          town: "Kilimani",
          address: "Sample Appartment, Rose Avenue",
          orderStatus: "DELIVERED",
          paymentStatus: "SUCCESS",
          isGift: true,
          items: {
            create: [
              {
                productId: frame.id,
                name: frame.name,
                sku: frame.sku,
                image: PRODUCT_PHOTO["product-02"] ? photoUrl(PRODUCT_PHOTO["product-02"]) : "/placeholders/product-02.svg",
                price: frame.price,
                quantity: 1,
              },
              {
                productId: journal.id,
                name: journal.name,
                sku: journal.sku,
                image: PRODUCT_PHOTO["product-01"] ? photoUrl(PRODUCT_PHOTO["product-01"]) : "/placeholders/product-01.svg",
                price: journal.price,
                quantity: 1,
                personalizationJson: JSON.stringify({ engravingText: "A.K." }),
              },
            ],
          },
          payments: {
            create: [
              {
                provider: "M_PESA",
                status: "SUCCESS",
                amount: frame.price + journal.price + 150,
                phone: "254712345678",
                mpesaReceipt: "SEEDSMP1",
                resultCode: 0,
                resultDescription: "The service request is processed successfully.",
                transactionDate: new Date(),
              },
            ],
          },
        },
      });
    }
  }

  console.log("Seed complete: users, categories, collections, products, delivery zones, gift wraps, coupons, sample order.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());