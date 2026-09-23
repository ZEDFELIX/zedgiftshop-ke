import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * The standalone home page has been removed.
 * Opening the site lands visitors directly on the shop.
 */
export default function RootPage() {
  redirect("/shop");
}
