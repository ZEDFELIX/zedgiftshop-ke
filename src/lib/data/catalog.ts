// Type definitions for static data
export interface StaticCategory {
  id: string
  slug: string
  name: string
  kind: "CATEGORY" | "OCCASION" | "RECIPIENT"
  productCount: number
  description?: string
  _count: { products: number }
}

// Static collections data
export interface StaticCollection {
  id: string
  slug: string
  name: string
  description: string
  productCount: number
}

// Static categories data
export const staticCategories: StaticCategory[] = [
  { id: "1", slug: "for-colleagues", name: "For Colleagues", kind: "CATEGORY", productCount: 12, description: "Professional, tasteful and genuinely useful gifts for teammates, mentors and the people you share deadlines with.", _count: { products: 12 } },
  { id: "2", slug: "just-because", name: "Just Because", kind: "CATEGORY", productCount: 8, description: "Thoughtful gifts for no particular occasion — because sometimes the best gifts are the ones that just say 'thinking of you'.", _count: { products: 8 } },
  { id: "3", slug: "gourmet", name: "Gourmet", kind: "CATEGORY", productCount: 6, description: "Delicious food and drink gifts for the gastronome in your life.", _count: { products: 6 } },
  { id: "4", slug: "personalized", name: "Personalized", kind: "CATEGORY", productCount: 15, description: "Custom engraved and monogrammed gifts made specially for your loved ones.", _count: { products: 15 } },
  { id: "5", slug: "gift-baskets", name: "Gift Baskets", kind: "CATEGORY", productCount: 10, description: "Curated gift baskets for all occasions, delivered across Kenya.", _count: { products: 10 } },
];

// Static collections data
export const staticCollections: StaticCollection[] = [
  { id: "1", slug: "for-colleagues", name: "For Colleagues", description: "Professional, tasteful and genuinely useful gifts for teammates, mentors and the people you share deadlines with.", productCount: 12 },
  { id: "2", slug: "just-because", name: "Just Because", description: "Thoughtful gifts for no particular occasion — because sometimes the best gifts are the ones that just say 'thinking of you'.", productCount: 8 },
  { id: "3", slug: "gourmet", name: "Gourmet", description: "Delicious food and drink gifts for the gastronome in your life.", productCount: 6 },
];

// Mock implementation - returns static data
export async function listCollections(): Promise<StaticCollection[]> {
  return staticCollections;
}

export async function getCollectionBySlug(slug: string) {
  return staticCollections.find((c) => c.slug === slug) || null;
}

export async function listCategories(kind?: "CATEGORY" | "OCCASION" | "RECIPIENT"): Promise<StaticCategory[]> {
  if (kind) {
    return staticCategories.filter((c) => c.kind === kind);
  }
  return staticCategories;
}

export async function getCategoryBySlug(slug: string) {
  return staticCategories.find((c) => c.slug === slug) || null;
}

export async function listGiftPages(): Promise<{ slug: string; name: string; kind: string; productCount: number }[]> {
  return staticCategories.map((c) => ({
    slug: c.slug,
    name: c.name,
    kind: c.kind,
    productCount: c.productCount,
  }));
}

// Gift page content mapping
export const GIFT_PAGE_CONTENT: Record<string, { title: string; description: string }> = {
  "for-him": {
    title: "Gifts for Him",
    description:
      "Crafted, practical and personal — find a gift that fits the man who makes every day easier. Wallets, accessories, office pieces and keepsakes he'll actually reach for.",
  },
  "for-her": {
    title: "Gifts for Her",
    description:
      "Thoughtful, elegant and personal — pieces that match her style and the way she cares for everyone else. Ready to be made truly hers with a name, a message or a photo.",
  },
  "for-couples": {
    title: "For Couples",
    description:
      "For the two of you — matching sets, shared keepsakes and experiences in a box. Personalize them with both names and the date that matters.",
  },
  birthday: {
    title: "Birthday Gifts",
    description:
      "Make the day about them. Personalized keepsakes, gift boxes and bundles that turn another year around the sun into something worth remembering.",
  },
  anniversary: {
    title: "Anniversary Gifts",
    description:
      "Celebrate the years you've built together. Engraved, personalized and made-to-last reminders of your milestone — from the first to the fifty-first.",
  },
  graduation: {
    title: "Graduation Gifts",
    description:
      "They did the work — now mark it. Personalized notebooks, desk pieces and keepsakes for the graduate stepping into what's next.",
  },
  corporate: {
    title: "Corporate Gifts",
    description:
      "Client appreciation, staff recognition and event gifting, done properly. Branded merchandise, gift boxes and bulk ordering with dedicated support.",
  },
  "for-friends": {
    title: "Gifts for Friends",
    description:
      "For the friends who feel like family. Fun, personal and no-pressure gifts that say you were paying attention.",
  },
  "for-parents": {
    title: "Gifts for Parents",
    description:
      "Show them the thought they've always given you. Classic, quality and personalized gifts for mum and dad.",
  },
  "for-colleagues": {
    title: "Gifts for Colleagues",
    description:
      "Professional, tasteful and genuinely useful — for teammates, mentors and the people you share deadlines with.",
  },
};

export async function getGiftPageContent(slug: string) {
  const category = staticCategories.find((c) => c.slug === slug);
  const staticContent = GIFT_PAGE_CONTENT[slug];
  if (category) {
    return {
      title: category.name,
      description: staticContent?.description ?? category.description ?? "",
      fallback: staticContent?.description,
    };
  }
  return {
    title: staticContent?.title ?? "Gifts",
    description: staticContent?.description ?? "",
    fallback: null,
  };
}