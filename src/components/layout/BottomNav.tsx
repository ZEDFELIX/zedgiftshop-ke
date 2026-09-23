"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Gift,
  Heart,
  User,
  ShoppingCart,
} from "lucide-react";
import { useCallback } from "react";

const NAV_ITEMS = [
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/gifts", label: "Gifts", icon: Gift },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account", label: "Account", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const isActive = useCallback(
    (href: string) => pathname.startsWith(href),
    [pathname]
  );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zed-900/15 bg-zed-950/95 backdrop-blur-xl lg:hidden"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around gap-1 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`group relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition-colors ${
                active
                  ? "text-white"
                  : "text-white/40 hover:text-white/80"
              }`}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-semibold">{label}</span>
              {active && (
                <span className="absolute -top-px left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-full bg-zed-950" />
              )}
            </Link>
          );
        })}
      </div>
      {/* Cart FAB */}
      <button
        type="button"
        aria-label="Open cart"
        onClick={() => window.dispatchEvent(new CustomEvent("zed:open-cart"))}
        className="absolute -top-5 mx-auto grid size-10 place-items-center rounded-full bg-zed-950 text-white shadow-glass-lg transition-transform hover:scale-110"
      >
        <ShoppingCart className="size-5" />
      </button>
    </nav>
  );
}
