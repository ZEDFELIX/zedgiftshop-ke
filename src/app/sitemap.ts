import type { MetadataRoute } from "next";
import { SITE, GIFT_ROUTES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = SITE.url;

  const staticRoutes = [
    "/shop", "/search", "/deals", "/collections", "/gifts", "/personalized", "/wishlist",
    "/gift-builder", "/track", "/contact", "/about", "/policies/delivery", "/policies/privacy",
    "/policies/terms", "/login", "/register", "/forgot-password",
  ].map((p) => ({ url: `${url}${p}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: p === "/shop" ? 1 : 0.8 }));

  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
  });
  const productRoutes = products.map((p) => ({
    url: `${url}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const collections = await prisma.collection.findMany({ select: { slug: true, updatedAt: true } });

  const collectionRoutes = collections.map((c) => ({
    url: `${url}/collections/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
  const giftRoutes = GIFT_ROUTES.map((g) => ({
    url: `${url}${g.href}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...collectionRoutes, ...giftRoutes];
}