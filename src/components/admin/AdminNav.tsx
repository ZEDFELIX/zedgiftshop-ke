"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {}, [pathname]);

  const isDashboard = pathname === "/admin";

  return (
    <nav className="space-y-1 px-2 pb-2 flex flex-col sm:static sm:block border-y border-zed-900/10">
      <Link
        href="/admin"
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isDashboard ? "bg-deep-olive/10 text-deep-olive" : "text-black/80 hover:bg-zed-900/10 hover:text-deep-olive"}`}
        aria-label="Dashboard"
      >
        <LayoutDashboard className="size-4" />
        Dashboard
      </Link>

      <ul className="mt-2 space-y-1">
        <li className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${isDashboard ? "bg-deep-olive/10 text-deep-olive" : "text-black/80 hover:bg-zed-900/10 hover:text-deep-olive"}`}>
          <Link href="/admin/orders" className="flex items-center gap-2.5" aria-label="Orders">
            Orders
          </Link>
        </li>
        <li className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${isDashboard ? "bg-deep-olive/10 text-deep-olive" : "text-black/80 hover:bg-zed-900/10 hover:text-deep-olive"}`}>
          <Link href="/admin/payments" className="flex items-center gap-2.5" aria-label="Payments">
            Payments
          </Link>
        </li>
        <li className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${isDashboard ? "bg-deep-olive/10 text-deep-olive" : "text-black/80 hover:bg-zed-900/10 hover:text-deep-olive"}`}>
          <Link href="/admin/products" className="flex items-center gap-2.5" aria-label="Products">
            Products
          </Link>
        </li>
      </ul>

      <div className="mt-auto pt-4 border-t border-zed-900/10">
        <button
          type="button"
          onClick={() => router.replace("/logout")}
          className="flex items-center gap-2.5 text-sm text-black/60 hover:text-black transition-colors"
          aria-label="Logout"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </div>
    </nav>
  );
}