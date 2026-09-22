import "server-only";

import { SITE } from "@/lib/constants";
import { cartCountForHeader } from "@/lib/cart";
import { getWishlistIds } from "@/lib/wishlist";
import { getCurrentUser } from "@/lib/auth";
import { getSetting } from "@/lib/data/settings";
import { HeaderContent } from "@/components/layout/HeaderContent";

export async function Header() {
  const [cartCount, user, announcementRaw] = await Promise.all([
    cartCountForHeader().catch(() => 0),
    getCurrentUser().catch(() => null),
    getSetting("announcementText").catch(() => SITE.announcement),
  ]);
  const wishlistCount = user ? (await getWishlistIds(user.id).catch(() => []))?.length : 0;
  const announcement =
    typeof announcementRaw === "string" && announcementRaw.trim()
      ? announcementRaw
      : SITE.announcement;

  return (
    <HeaderContent
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      announcement={announcement}
      isAuthed={Boolean(user)}
      userRole={user?.role ?? null}
    />
  );
}