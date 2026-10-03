"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Filter,
} from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setNavOpen(false);
        setFiltersOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { label: "Home", href: "/", key: "home", icon: Home },
    { label: "Categories", href: "/collections", key: "categories", icon: LayoutGrid },
    { label: "Search", href: "/shop", key: "search", icon: Search },
    { label: "Cart", href: "/cart", key: "cart", icon: ShoppingBag },
    { label: "Account", href: "/account", key: "account", icon: User },
  ];

  return (
    <div
      ref={navRef}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-zed-900/10 shadow-lg"
    >
      <div className="h-14 flex items-center justify-between px-4 lg:hidden">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setNavOpen(true)}
          className="tap-target grid size-9 place-items-center rounded-full bg-zed-950 text-black hover:bg-zed-900"
        >
          <Menu className="size-5" />
        </button>
        <span className="font-display text-base font-black tracking-[0.08em] text-black">
          ZED <span className="text-soft-sage">GIFT SHOP</span>
        </span>
        {/* Filter button - desktop */}
        <button
          type="button"
          aria-label="Open filters"
          onClick={() => setFiltersOpen(true)}
          className="tap-target grid size-9 place-items-center rounded-full bg-zed-950/20 text-sm text-black/60 hover:bg-zed-950"
        >
          <Filter className="size-4" />
          <span className="hidden lg:inline text-[10px]">Filters</span>
          {filtersOpen && (
            <span className="grid size-5 place-items-center rounded-full bg-zed-950 text-[11px] font-bold text-white">F</span>
          )}
        </button>
      </div>

      {/* Bottom nav bar - 5 items */}
      <div className="flex gap-1 px-2 pb-1">
        {navLinks.map((link) => (
          <button
            key={link.key}
            type="button"
            aria-label={link.label}
            className={`flex flex-1 items-center justify-center rounded-2xl px-1 py-2 text-xs font-medium transition-colors ${
              pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href.split("?")[0]))
                ? "bg-deep-olive text-white"
                : "text-black/60 hover:bg-zed-900/5 hover:text-deep-olive"
            }`}
            onClick={() => {
              setNavOpen(false);
              router.push(link.href);
            }}
          >
            <link.icon className="size-4" />
            <span className="hidden lg:inline text-[10px]">{link.label}</span>
          </button>
        ))}
      </div>

      {/* Mobile nav drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setNavOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[min(88vw,340px)] flex-col bg-white/95 shadow-drawer backdrop-blur-xl animate-[menu-in_0.3s_cubic-bezier(0.16,1,0.3,1)_both]">
            <div className="flex items-center justify-between border-b border-zed-900/10 px-4 py-4">
              <span className="font-display text-base font-black tracking-[0.08em] text-black">
                ZED <span className="text-soft-sage">GIFT SHOP</span>
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setNavOpen(false)}
                className="tap-target grid size-9 place-items-center rounded-full hover:bg-zed-900/5"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3" aria-label="Mobile">
              {navLinks.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => {
                    setNavOpen(false);
                    router.push(l.href);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-black hover:bg-zed-900/5"
                >
                  <l.icon className="size-5" />
                  {l.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}